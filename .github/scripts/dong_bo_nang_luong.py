# -*- coding: utf-8 -*-
"""
ĐỒNG BỘ NÂNG LƯƠNG: app theo dõi nâng lương (bảng theo_doi_luong)  →  app hồ sơ (bảng hs_nang_luong)

Chạy tự động bằng GitHub Actions lúc 2 giờ sáng mỗi ngày (giờ Việt Nam), hoặc bấm "Run workflow".
Cần 4 Secrets trong repo: NL_URL, NL_KEY (project nâng lương), HS_URL, HS_KEY (project hồ sơ, khóa service_role).

Cách tính hệ số, ngày nâng lương dự kiến giống hệt app nâng lương v4.7 (bảng lương NĐ 204/2004).
Có chốt an toàn: nếu đọc được quá ít dòng so với lần trước thì dừng, không ghi đè.
"""
import os
import re
import sys
import unicodedata
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from supabase import create_client

BANG_HE_SO = {
    "A3": [6.20, 6.56, 6.92, 7.28, 7.64, 8.00],
    "A2": [4.40, 4.74, 5.08, 5.42, 5.76, 6.10, 6.44, 6.78],
    "A1": [2.34, 2.67, 3.00, 3.33, 3.66, 3.99, 4.32, 4.65, 4.98],
    "B": [round(1.86 + 0.20 * i, 2) for i in range(12)],
    "LAI_XE": [round(2.05 + 0.18 * i, 2) for i in range(12)],
    "PHUC_VU": [round(1.00 + 0.18 * i, 2) for i in range(12)],
}
THOI_HAN = {"A3": 3, "A2": 3, "A1": 3, "B": 2, "LAI_XE": 2, "PHUC_VU": 2}


def xac_dinh_nhom(ngach, ma_ngach, chuc_vu):
    n = str(ngach or "").strip().upper()
    cv = str(chuc_vu or "").strip().upper()
    ma = re.sub(r"\D", "", str(ma_ngach or ""))
    if "LÁI XE" in n or "LÁI XE" in cv:
        return "LAI_XE"
    if "PHỤC VỤ" in n or "TẠP VỤ" in cv or ma == "01009":
        return "PHUC_VU"
    if "TRUNG CẤP" in n or ma in ("06032", "02008"):
        return "B"
    if n == "CVCC" or "CAO CẤP" in n or ma == "01001":
        return "A3"
    if n == "CVC" or "CHÍNH" in n or ma == "01002":
        return "A2"
    return "A1"


def ten_chuan(s):
    s = unicodedata.normalize("NFD", str(s or "")).replace("đ", "d").replace("Đ", "D")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip().lower()


def doc_he_so(v):
    try:
        return round(float(str(v).replace(",", ".")), 2)
    except (TypeError, ValueError):
        return None


def doc_ngay(v):
    try:
        return datetime.strptime(str(v).strip(), "%d/%m/%Y").date()
    except (TypeError, ValueError):
        return None


def co_vk(v):
    s = str(v or "").strip().lower()
    return s not in ("", "none", "nan") and "%" in s


def tinh(row):
    """Trả về dict các cột tính được, giống app nâng lương v4.7."""
    bac = str(row.get("bac_luong") or "").strip()
    hs = doc_he_so(row.get("he_so_hien_tai"))
    vk = str(row.get("vuot_khung_hien_tai") or "").strip()
    ngay = doc_ngay(row.get("ngay_gan_nhat"))
    kq = {"bac_moi": bac or None, "he_so_moi": hs, "vuot_khung_moi": None, "ngay_du_kien": None, "loai": "thuong_xuyen"}
    if not ngay:
        return kq
    nhom = xac_dinh_nhom(row.get("ngach_luong"), row.get("ma_ngach"), row.get("chuc_vu"))
    bang, han = BANG_HE_SO[nhom], THOI_HAN[nhom]
    if co_vk(vk):
        so_vk = int(re.sub(r"\D", "", vk) or 0)
        kq.update(vuot_khung_moi=f"{so_vk + 1}%", ngay_du_kien=ngay + relativedelta(years=1), loai="vuot_khung")
        return kq
    try:
        x, y = map(int, bac.split("/")) if "/" in bac else (int(bac), 99)
    except ValueError:
        return kq
    if x >= y:
        kq.update(vuot_khung_moi="5%", ngay_du_kien=ngay + relativedelta(years=han), loai="vuot_khung")
    else:
        hs_moi = bang[x] if x < len(bang) else (hs or 0) + (bang[-1] - bang[-2])
        kq.update(bac_moi=f"{x + 1}/{y}", he_so_moi=round(hs_moi, 2), ngay_du_kien=ngay + relativedelta(years=han))
    return kq


def main():
    can = ["NL_URL", "NL_KEY", "HS_URL", "HS_KEY"]
    thieu = [k for k in can if not os.environ.get(k)]
    if thieu:
        sys.exit(f"Thiếu Secrets: {', '.join(thieu)}. Vào Settings → Secrets and variables → Actions để thêm.")
    nl = create_client(os.environ["NL_URL"].strip(), os.environ["NL_KEY"].strip())
    hs = create_client(os.environ["HS_URL"].strip(), os.environ["HS_KEY"].strip())

    def ghi_nhat_ky(ok, so_dong=None, da_ghep=None, ghi_chu=""):
        try:
            hs.table("hs_dong_bo").insert({"thanh_cong": ok, "so_dong": so_dong, "da_ghep": da_ghep, "ghi_chu": ghi_chu[:2000]}).execute()
        except Exception as e:
            print("Không ghi được nhật ký đồng bộ:", e)

    try:
        nguon = nl.table("theo_doi_luong").select("*").execute().data or []
        nguon = [r for r in nguon if str(r.get("ho_ten") or "").strip()]
        cu = hs.table("hs_nang_luong").select("nguon_id").execute().data or []

        # Chốt an toàn: app nâng lương có thể đang lưu dở, hoặc đọc nhầm project
        if not nguon:
            raise RuntimeError("Đọc được 0 dòng từ theo_doi_luong — dừng, không ghi đè dữ liệu cũ.")
        if len(cu) >= 10 and len(nguon) < len(cu) * 0.5:
            raise RuntimeError(f"Chỉ đọc được {len(nguon)} dòng trong khi lần trước có {len(cu)} — dừng để tránh mất dữ liệu.")

        ho_so = hs.table("hs_ho_so").select("id, ho_ten").execute().data or []
        theo_ten = {}
        for h in ho_so:
            theo_ten.setdefault(ten_chuan(h["ho_ten"]), []).append(h["id"])
        ghep_tay = {g["ten_chuan"]: g for g in (hs.table("hs_ghep_luong").select("*").execute().data or [])}

        dong, da_ghep, chua_ghep, luc = [], 0, [], datetime.utcnow().isoformat() + "Z"
        for r in nguon:
            tc = ten_chuan(r["ho_ten"])
            if tc in ghep_tay:
                hid = None if ghep_tay[tc]["bo_qua"] else ghep_tay[tc]["ho_so_id"]
            else:
                ung_vien = theo_ten.get(tc, [])
                hid = ung_vien[0] if len(ung_vien) == 1 else None
                if hid is None:
                    chua_ghep.append(r["ho_ten"] + (" (trùng tên)" if len(ung_vien) > 1 else ""))
            da_ghep += 1 if hid else 0
            t = tinh(r)
            dong.append({
                "nguon_id": int(r["id"]), "ho_ten": str(r["ho_ten"]).strip(), "ten_chuan": tc,
                "chuc_vu": r.get("chuc_vu"), "ma_ngach": str(r.get("ma_ngach") or "") or None,
                "ngach_luong": r.get("ngach_luong"), "bac_luong": r.get("bac_luong"),
                "he_so": doc_he_so(r.get("he_so_hien_tai")),
                "vuot_khung": r.get("vuot_khung_hien_tai") if co_vk(r.get("vuot_khung_hien_tai")) else None,
                "ngay_gan_nhat": doc_ngay(r.get("ngay_gan_nhat")).isoformat() if doc_ngay(r.get("ngay_gan_nhat")) else None,
                "bac_moi": t["bac_moi"], "he_so_moi": t["he_so_moi"], "vuot_khung_moi": t["vuot_khung_moi"],
                "ngay_du_kien": t["ngay_du_kien"].isoformat() if t["ngay_du_kien"] else None,
                "loai": t["loai"], "ho_so_id": hid, "dong_bo_luc": luc,
            })

        hs.table("hs_nang_luong").upsert(dong, on_conflict="nguon_id").execute()
        moi = {d["nguon_id"] for d in dong}
        xoa = [c["nguon_id"] for c in cu if c["nguon_id"] not in moi]
        for i in range(0, len(xoa), 100):
            hs.table("hs_nang_luong").delete().in_("nguon_id", xoa[i:i + 100]).execute()

        ghi_chu = f"Đã xóa {len(xoa)} dòng không còn ở app nâng lương." if xoa else ""
        if chua_ghep:
            ghi_chu += f" Chưa ghép được {len(chua_ghep)} người: {', '.join(chua_ghep)}."
        ghi_nhat_ky(True, len(dong), da_ghep, ghi_chu.strip())
        print(f"Xong: {len(dong)} dòng, ghép được {da_ghep}. {ghi_chu}")
    except Exception as e:
        ghi_nhat_ky(False, ghi_chu=str(e))
        sys.exit(f"Đồng bộ thất bại: {e}")


if __name__ == "__main__":
    main()
