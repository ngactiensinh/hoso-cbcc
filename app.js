/* =====================================================================
   HỒ SƠ CBCC — BAN TUYÊN GIÁO TỈNH ỦY TUYÊN QUANG  (v8.1 — Giai đoạn 2)
   GitHub Pages + Supabase (Auth + RLS)
   ===================================================================== */
'use strict';
(() => {
const CFG = window.HS_CONFIG || {};
const goc = document.getElementById('goc');

if (!window.supabase || !CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes('xxxx')) {
    goc.innerHTML = '<div class="chinh"><div class="tam"><div class="loi">Chưa cấu hình kết nối. Mở file <b>config.js</b>, dán SUPABASE_URL và khóa anon public của project.</div></div></div>';
    return;
}
const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'hoso-cbcc-auth' }
});
const EMAIL_DOMAIN = CFG.EMAIL_DOMAIN || 'hoso-btgtq.vn';

// ─────────────────────────────────────────────────────────
// 1. DANH MỤC
// ─────────────────────────────────────────────────────────
const DS_DON_VI = ['Lãnh đạo Ban', 'Văn phòng Ban', 'Phòng Lý luận chính trị, Lịch sử Đảng',
    'Phòng Tuyên truyền, Báo chí - Xuất bản', 'Phòng Khoa giáo, Văn hóa - Văn nghệ'];
const DS_CHUC_VU = ['Trưởng Ban', 'Phó Trưởng ban Thường trực', 'Phó Trưởng Ban', 'Chánh Văn phòng',
    'Phó Chánh Văn phòng', 'Trưởng phòng', 'Phó Trưởng phòng', 'Chuyên viên chính', 'Chuyên viên',
    'Văn thư viên', 'Văn thư viên trung cấp', 'Kế toán viên', 'Kế toán viên trung cấp',
    'Nhân viên lái xe', 'Nhân viên phục vụ'];
const DS_LY_LUAN = ['Chưa qua đào tạo', 'Sơ cấp', 'Trung cấp', 'Cao cấp', 'Cử nhân'];
const DS_DAN_TOC = ['Kinh', 'Tày', 'Thái', 'Mường', 'Khmer', 'Hoa', 'Nùng', "H'Mông", 'Dao', 'Gia Rai',
    'Ê Đê', 'Ba Na', 'Sán Chay', 'Chăm', 'Cơ Ho', 'Xơ Đăng', 'Sán Dìu', 'Hrê', 'Ra Glai', 'Mnông', 'Thổ',
    'Xtiêng', 'Khơ Mú', 'Bru - Vân Kiều', 'Cơ Tu', 'Giáy', 'Tà Ôi', 'Mạ', 'Giẻ - Triêng', 'Co', 'Chơ Ro',
    'Xinh Mun', 'Hà Nhì', 'Chu Ru', 'Lào', 'La Chí', 'Kháng', 'Phù Lá', 'La Hủ', 'La Ha', 'Pà Thẻn', 'Lự',
    'Ngái', 'Chứt', 'Lô Lô', 'Mảng', 'Cơ Lao', 'Bố Y', 'Cống', 'Si La', 'Pu Péo', 'Rơ Măm', 'Brâu', 'Ơ Đu'];
const DS_TON_GIAO = ['Không', 'Phật giáo', 'Công giáo', 'Tin lành', 'Cao Đài', 'Hòa Hảo', 'Hồi giáo'];
const DS_GDPT = ['12/12', '10/10', '9/9', '7/10'];
const DS_HOC_VI = ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ'];
const DS_QLNN = ['Chưa qua bồi dưỡng', 'Chuyên viên', 'Chuyên viên chính', 'Chuyên viên cao cấp'];
const DS_NGACH = ['Chuyên viên cao cấp', 'Chuyên viên chính', 'Chuyên viên', 'Kế toán viên',
    'Kế toán viên trung cấp', 'Văn thư viên', 'Văn thư viên trung cấp', 'Nhân viên lái xe', 'Nhân viên phục vụ'];
const DS_NHOM_MAU = ['A', 'B', 'AB', 'O'];
const DS_SUC_KHOE = ['Tốt', 'Khá', 'Trung bình'];
const DS_HINH_THUC = ['Chính quy', 'Vừa làm vừa học', 'Tại chức', 'Từ xa', 'Tập trung', 'Bồi dưỡng'];

// ─────────────────────────────────────────────────────────
// 2. CẤU TRÚC HỒ SƠ (theo Mẫu 2C-BNV/2008, không có quan hệ gia đình)
//    [khóa, nhãn, loại, tùy chọn]  loại: chu | ngay | so | chon | goi_y | van
// ─────────────────────────────────────────────────────────
const truong = ([k, n, loai = 'chu', tc = {}]) => ({ k, n, loai, ...tc });
const MUC = [
    { ten: 'Thông tin cá nhân', truong: [
        ['ho_ten', 'Họ và tên khai sinh', 'chu', { bat: 1 }],
        ['ten_goi_khac', 'Tên gọi khác'],
        ['ngay_sinh', 'Ngày sinh', 'ngay'],
        ['gioi_tinh', 'Giới tính', 'chon', { ds: ['Nam', 'Nữ'] }],
        ['noi_sinh', 'Nơi sinh'],
        ['que_quan', 'Quê quán'],
        ['dan_toc', 'Dân tộc', 'goi_y', { ds: DS_DAN_TOC }],
        ['ton_giao', 'Tôn giáo', 'goi_y', { ds: DS_TON_GIAO }],
        ['quoc_tich', 'Quốc tịch'],
        ['so_cccd', 'Số CCCD', 'chu', { goiY: '12 chữ số' }],
        ['ngay_cap_cccd', 'Ngày cấp CCCD', 'ngay'],
        ['so_bhxh', 'Số sổ BHXH'],
        ['thuong_tru', 'Nơi đăng ký thường trú', 'chu', { rong: 1 }],
        ['noi_o_hien_nay', 'Nơi ở hiện nay', 'chu', { rong: 1 }],
    ]},
    { ten: 'Công tác hiện tại', truong: [
        ['don_vi', 'Đơn vị công tác', 'chon', { ds: DS_DON_VI }],
        ['chuc_vu', 'Chức vụ (chức danh) hiện tại', 'goi_y', { ds: DS_CHUC_VU }],
        ['chuc_vu_dang', 'Chức vụ trong Đảng'],
        ['ngay_tuyen_dung', 'Ngày tuyển dụng', 'ngay'],
        ['co_quan_tuyen_dung', 'Cơ quan tuyển dụng'],
        ['nghe_nghiep_khi_tuyen', 'Nghề nghiệp khi được tuyển dụng'],
        ['nghe_nghiep_hien_nay', 'Nghề nghiệp hiện nay'],
        ['cong_viec_chinh', 'Công việc chính được giao', 'van', { rong: 1 }],
    ]},
    { ten: 'Ngạch, bậc lương hiện hưởng', truong: [
        ['ngach_cong_chuc', 'Ngạch công chức', 'goi_y', { ds: DS_NGACH }],
        ['ma_ngach', 'Mã ngạch', 'chu', { goiY: 'Ví dụ: 01.003' }],
        ['bac_luong', 'Bậc lương', 'chu', { goiY: 'Ví dụ: 4/9' }],
        ['he_so_luong', 'Hệ số lương', 'so'],
        ['ngay_huong_luong', 'Ngày hưởng', 'ngay'],
        ['phu_cap_chuc_vu', 'Phụ cấp chức vụ (hệ số)', 'so'],
        ['phu_cap_khac', 'Phụ cấp khác', 'chu', { rong: 1 }],
    ]},
    { ten: 'Trình độ', truong: [
        ['giao_duc_pt', 'Giáo dục phổ thông', 'goi_y', { ds: DS_GDPT }],
        ['trinh_do_chuyen_mon', 'Trình độ chuyên môn cao nhất', 'chu', { goiY: 'Ví dụ: Đại học Luật' }],
        ['hoc_vi', 'Học vị', 'goi_y', { ds: DS_HOC_VI }],
        ['ly_luan_chinh_tri', 'Lý luận chính trị', 'chon', { ds: DS_LY_LUAN }],
        ['quan_ly_nha_nuoc', 'Quản lý nhà nước', 'goi_y', { ds: DS_QLNN }],
        ['ngoai_ngu', 'Ngoại ngữ'],
        ['tin_hoc', 'Tin học'],
    ]},
    { ten: 'Đảng, đoàn thể, quân ngũ', truong: [
        ['ngay_vao_dang', 'Ngày vào Đảng', 'ngay'],
        ['ngay_chinh_thuc', 'Ngày chính thức', 'ngay'],
        ['tham_gia_tcctxh', 'Tham gia tổ chức chính trị - xã hội', 'chu', { goiY: 'Ví dụ: Đoàn TNCS Hồ Chí Minh, ngày 26/3/2005', rong: 1 }],
        ['ngay_nhap_ngu', 'Ngày nhập ngũ', 'ngay'],
        ['ngay_xuat_ngu', 'Ngày xuất ngũ', 'ngay'],
        ['quan_ham_cao_nhat', 'Quân hàm cao nhất'],
    ]},
    { ten: 'Danh hiệu, sở trường, khen thưởng', truong: [
        ['danh_hieu_cao_nhat', 'Danh hiệu được phong tặng cao nhất'],
        ['so_truong', 'Sở trường công tác'],
        ['khen_thuong_tom_tat', 'Khen thưởng (hình thức cao nhất)', 'chu', { rong: 1 }],
        ['ky_luat_tom_tat', 'Kỷ luật (hình thức cao nhất)', 'chu', { rong: 1 }],
    ]},
    { ten: 'Sức khỏe và chính sách', truong: [
        ['suc_khoe', 'Tình trạng sức khỏe', 'goi_y', { ds: DS_SUC_KHOE }],
        ['chieu_cao', 'Chiều cao (cm)', 'so', { nguyen: 1 }],
        ['can_nang', 'Cân nặng (kg)', 'so', { nguyen: 1 }],
        ['nhom_mau', 'Nhóm máu', 'chon', { ds: DS_NHOM_MAU }],
        ['thuong_binh_hang', 'Thương binh hạng'],
        ['gia_dinh_chinh_sach', 'Con gia đình chính sách'],
    ]},
    { ten: 'Đặc điểm lịch sử bản thân', truong: [
        ['dac_diem_lich_su', 'Đặc điểm lịch sử bản thân', 'van', { rong: 1,
            goiY: 'Khai rõ: bị bắt, bị tù (thời gian, ở đâu), đã khai báo cho ai; có làm việc trong chế độ cũ không (nếu có).' }],
    ]},
].map(m => ({ ...m, truong: m.truong.map(truong) }));
const TRUONG = Object.fromEntries(MUC.flatMap(m => m.truong).map(f => [f.k, f]));

const BANG_CON = {
    hs_cong_tac: { ten: 'Quá trình công tác', don: 'quá trình công tác', thuTu: 'id', cot: [
        ['tu_ngay', 'Từ tháng/năm', 'chu', { goiY: 'Ví dụ: 03/2015' }],
        ['den_ngay', 'Đến tháng/năm', 'chu', { goiY: 'Để trống nếu đến nay' }],
        ['vi_tri', 'Chức danh, chức vụ', 'chu', { bat: 1 }],
        ['don_vi', 'Đơn vị công tác', 'chu', { rong: 1 }],
        ['quyet_dinh_so', 'Quyết định số'],
    ]},
    hs_dao_tao: { ten: 'Đào tạo, bồi dưỡng', don: 'khóa đào tạo, bồi dưỡng', thuTu: 'id', cot: [
        ['ten_truong', 'Tên trường', 'chu', { bat: 1, rong: 1 }],
        ['nganh_hoc', 'Chuyên ngành đào tạo, bồi dưỡng', 'chu', { rong: 1 }],
        ['tu_ngay', 'Từ tháng/năm'],
        ['den_ngay', 'Đến tháng/năm'],
        ['hinh_thuc', 'Hình thức', 'goi_y', { ds: DS_HINH_THUC }],
        ['van_bang', 'Văn bằng, chứng chỉ'],
    ]},
    hs_luong: { ten: 'Diễn biến lương', don: 'mốc lương', thuTu: 'ngay_quyet_dinh', cot: [
        ['ngay_quyet_dinh', 'Ngày quyết định', 'ngay'],
        ['bac_luong', 'Bậc lương'],
        ['he_so', 'Hệ số', 'so'],
        ['ngay_nang_bac_tiep_theo', 'Ngày tính nâng bậc tiếp theo', 'ngay'],
        ['quyet_dinh_so', 'Quyết định số'],
    ]},
    hs_khen_thuong: { ten: 'Khen thưởng, kỷ luật', don: 'khen thưởng/kỷ luật', thuTu: 'ngay_quyet_dinh', cot: [
        ['ngay_quyet_dinh', 'Ngày quyết định', 'ngay'],
        ['loai', 'Loại', 'chon', { ds: ['Khen thưởng', 'Kỷ luật'], bat: 1 }],
        ['quyet_dinh_so', 'Quyết định số'],
        ['he_thong', 'Kỷ luật theo', 'chon', { ds: ['Chính quyền', 'Đảng'], kl: 1 }],
        ['hinh_thuc', 'Hình thức kỷ luật', 'chon', { ds: ['Khiển trách', 'Cảnh cáo', 'Hạ bậc lương', 'Giáng chức', 'Cách chức', 'Buộc thôi việc', 'Khai trừ'], kl: 1 }],
        ['ngay_het_han', 'Hết thời hạn kỷ luật', 'ngay', { kl: 1, goiY: 'Tự gợi ý theo hình thức, sửa được' }],
        ['noi_dung', 'Nội dung', 'van', { rong: 1 }],
    ]},
};
Object.values(BANG_CON).forEach(b => { b.cot = b.cot.map(truong); });

// Các mục tính % hoàn thiện
const MUC_HOAN_THIEN = ['ho_ten', 'ngay_sinh', 'gioi_tinh', 'noi_sinh', 'que_quan', 'dan_toc', 'ton_giao',
    'thuong_tru', 'noi_o_hien_nay', 'so_cccd', 'so_bhxh', 'don_vi', 'chuc_vu', 'ngay_tuyen_dung',
    'ngach_cong_chuc', 'ma_ngach', 'bac_luong', 'he_so_luong', 'giao_duc_pt', 'trinh_do_chuyen_mon',
    'ly_luan_chinh_tri', 'ngoai_ngu', 'tin_hoc', 'suc_khoe'];

// ─────────────────────────────────────────────────────────
// 3. TIỆN ÍCH
// ─────────────────────────────────────────────────────────
const S = { session: null, tk: null, admin: false, hoSoCuaToi: null, ds: null, anh: {}, chuaLuu: false, hashCu: '', locDs: { tu: '', dv: '', tt: '' } };
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const boDau = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const trong = v => v === null || v === undefined || String(v).trim() === '';
const ngayVN = iso => { if (!iso) return ''; const [y, m, d] = String(iso).slice(0, 10).split('-'); return d ? `${d}/${m}/${y}` : String(iso); };
const soVN = (v, le = 2) => (v === null || v === undefined || v === '') ? '' : Number(v).toFixed(le).replace('.', ',');
const tuoi = iso => { if (!iso) return null; const s = new Date(iso), n = new Date(); let t = n.getFullYear() - s.getFullYear(); if (n < new Date(n.getFullYear(), s.getMonth(), s.getDate())) t--; return t; };
const emailTuMa = ma => `${String(ma).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cb'}@${EMAIL_DOMAIN}`;
const chuDau = ten => String(ten || '?').trim().split(/\s+/).slice(-1)[0].charAt(0).toUpperCase();
const thuTuDs = (ds, v) => { const i = ds.indexOf(v); return i < 0 ? 99 : i; };

async function q(p) {
    const { data, error } = await p;
    if (error) throw error;
    return data;
}

function dichLoi(e) {
    const m = String(e?.message || e || '');
    if (/Invalid login credentials/i.test(m)) return 'Sai mật khẩu.';
    if (/already registered|already been registered/i.test(m)) return 'Mã CBCC này đã được đăng ký.';
    if (/at least 6|Password should be/i.test(m)) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (/duplicate key/i.test(m)) return 'Dữ liệu bị trùng: mã này đã tồn tại.';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
    if (/JWT|token is expired|refresh token/i.test(m)) return 'Phiên đăng nhập đã hết hạn. Tải lại trang để đăng nhập lại.';
    if (/hs_nang_luong|hs_ghep_luong|hs_dong_bo|he_thong|hinh_thuc|ngay_het_han/.test(m) && /does not exist|Could not find|schema cache/i.test(m)) return 'Chưa chạy file sql/02_giai_doan_2.sql trong Supabase.';
    if (/row-level security|permission denied/i.test(m)) return 'Tài khoản không có quyền thực hiện thao tác này.';
    if (/Email signups are disabled|Signups not allowed/i.test(m)) return 'Hệ thống đang tạm khóa đăng ký mới. Liên hệ quản trị viên.';
    return m || 'Có lỗi xảy ra.';
}

function thongBao(msg, loi = false) {
    const el = document.createElement('div');
    if (loi) el.className = 'loi-tb';
    el.textContent = msg;
    $('#thong-bao').appendChild(el);
    setTimeout(() => el.remove(), loi ? 5000 : 3000);
}

function hopThoai({ tieuDe, noiDung = '', nutChinh = 'Lưu', nutPhu = 'Hủy', xuLy, sauKhiMo }) {
    return new Promise(res => {
        const phu = document.createElement('div');
        phu.className = 'phu';
        phu.innerHTML = `<form class="hop" role="dialog" aria-modal="true" aria-labelledby="hop-td" novalidate>
            <h3 id="hop-td">${esc(tieuDe)}</h3>${noiDung}
            <div class="loi an" data-loi style="margin-top:12px"></div>
            <div class="nhom-nut">${nutPhu ? `<button type="button" class="nut nut-nhe" data-huy>${esc(nutPhu)}</button>` : ''}
            <button type="submit" class="nut nut-chinh">${esc(nutChinh)}</button></div></form>`;
        document.body.appendChild(phu);
        const form = $('form', phu);
        const phim = e => { if (e.key === 'Escape') dong(null); };
        const dong = v => { phu.remove(); document.removeEventListener('keydown', phim); res(v); };
        document.addEventListener('keydown', phim);
        $('[data-huy]', phu)?.addEventListener('click', () => dong(null));
        phu.addEventListener('mousedown', e => { if (e.target === phu) dong(null); });
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const nut = $('[type=submit]', form), loi = $('[data-loi]', form);
            nut.disabled = true; loi.classList.add('an');
            try {
                const kq = xuLy ? await xuLy(new FormData(form), form) : true;
                if (typeof kq === 'string') { loi.textContent = kq; loi.classList.remove('an'); nut.disabled = false; return; }
                dong(kq === undefined ? true : kq);
            } catch (err) {
                loi.textContent = dichLoi(err); loi.classList.remove('an'); nut.disabled = false;
            }
        });
        if (sauKhiMo) sauKhiMo(form, dong);
        ($('input,select,textarea', form) || $('[type=submit]', form)).focus();
    });
}
const xacNhan = (tieuDe, noiDungHtml, nutChinh = 'Đồng ý') => hopThoai({ tieuDe, noiDung: `<p>${noiDungHtml}</p>`, nutChinh });

// Ô nhập theo cấu trúc trường
function oNhap(f, v) {
    const ten = `name="${f.k}" id="o_${f.k}"`;
    let gt = v ?? '';
    if (f.loai === 'so' && gt !== '') gt = soVN(gt, f.nguyen ? 0 : 2);
    let o;
    if (f.loai === 'chon') {
        const coSan = f.ds.includes(gt);
        o = `<select ${ten}><option value="">— Chọn —</option>${f.ds.map(x => `<option${x === gt ? ' selected' : ''}>${esc(x)}</option>`).join('')}${gt && !coSan ? `<option selected>${esc(gt)}</option>` : ''}</select>`;
    } else if (f.loai === 'van') {
        o = `<textarea ${ten}>${esc(gt)}</textarea>`;
    } else if (f.loai === 'goi_y') {
        o = `<input ${ten} list="dl_${f.k}" value="${esc(gt)}" autocomplete="off"><datalist id="dl_${f.k}">${f.ds.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;
    } else if (f.loai === 'ngay') {
        o = `<input ${ten} type="date" min="1900-01-01" max="2100-12-31" value="${esc(String(gt).slice(0, 10))}">`;
    } else if (f.loai === 'so') {
        o = `<input ${ten} inputmode="decimal" value="${esc(gt)}">`;
    } else {
        o = `<input ${ten} value="${esc(gt)}">`;
    }
    return `<label class="o${f.rong ? ' rong' : ''}"><span>${esc(f.n)}${f.bat ? ' <em>*</em>' : ''}</span>${o}${f.goiY ? `<small>${esc(f.goiY)}</small>` : ''}</label>`;
}

// Đọc giá trị từ form, trả về [dữ liệu, lỗi]
function docForm(fd, ds) {
    const kq = {};
    for (const f of ds) {
        const raw = String(fd.get(f.k) ?? '').trim();
        if (raw === '') {
            if (f.bat) return [null, `Chưa nhập ${f.n.toLowerCase()}.`];
            kq[f.k] = null; continue;
        }
        if (f.loai === 'so') {
            const n = Number(raw.replace(/\s/g, '').replace(',', '.'));
            if (!Number.isFinite(n) || n < 0) return [null, `${f.n} phải là số.`];
            kq[f.k] = f.nguyen ? Math.round(n) : Math.round(n * 100) / 100;
        } else {
            kq[f.k] = raw;
        }
    }
    return [kq, null];
}

function hienGiaTri(f, v) {
    if (trong(v)) return null;
    if (f.loai === 'ngay') return ngayVN(v);
    if (f.loai === 'so') return soVN(v, f.nguyen ? 0 : 2);
    return String(v);
}

function hoanThien(hs, coCT, coDT) {
    const thieu = MUC_HOAN_THIEN.filter(k => trong(hs[k])).map(k => TRUONG[k].n);
    if (trong(hs.anh_the)) thieu.push('Ảnh 3x4');
    if (!coCT) thieu.push('Quá trình công tác');
    if (!coDT) thieu.push('Đào tạo, bồi dưỡng');
    const tong = MUC_HOAN_THIEN.length + 3;
    return { p: Math.round((tong - thieu.length) / tong * 100), thieu, tong };
}

async function layAnh(paths) {
    const can = [...new Set(paths.filter(p => p && !(S.anh[p] && S.anh[p].het > Date.now())))];
    if (can.length) {
        const { data } = await sb.storage.from('anh-the').createSignedUrls(can, 3600);
        (data || []).forEach(d => { if (d.signedUrl) S.anh[d.path] = { url: d.signedUrl, het: Date.now() + 3500e3 }; });
    }
    return p => S.anh[p]?.url || null;
}

function lamAnhThe(file) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
            const W = 360, H = 480, tile = W / H;
            let sw = img.width, sh = img.height, sx = 0, sy = 0;
            if (sw / sh > tile) { sw = sh * tile; sx = (img.width - sw) / 2; } else { sh = sw / tile; sy = (img.height - sh) / 4; }
            const c = document.createElement('canvas'); c.width = W; c.height = H;
            const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
            g.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
            URL.revokeObjectURL(img.src);
            c.toBlob(b => b ? res(b) : rej(new Error('Không xử lý được ảnh.')), 'image/jpeg', 0.86);
        };
        img.onerror = () => rej(new Error('File này không phải ảnh hoặc ảnh bị lỗi.'));
        img.src = URL.createObjectURL(file);
    });
}

function ghiTruyCap() {
    try {
        if (sessionStorage.getItem('hs_da_dem')) return;
        sessionStorage.setItem('hs_da_dem', '1');
        sb.from('thong_ke_truy_cap').insert({ ten_app: 'Quản lý Hồ sơ CBCC' }).then(() => {}, () => {});
    } catch (_) { /* bỏ qua */ }
}

const ICON = {
    tq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/></svg>',
    ds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    tk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/></svg>',
    hs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h10l6 6v10H4z"/><path d="M14 4v6h6"/><circle cx="10" cy="13" r="2"/><path d="M7 18c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4"/></svg>',
    mk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    cb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    ra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
};

// ─────────────────────────────────────────────────────────
// 4. ĐĂNG NHẬP / ĐĂNG KÝ
// ─────────────────────────────────────────────────────────
function manDangNhap(loi = '', tb = '') {
    S.session = null; S.tk = null; S.ds = null; S.anh = {};
    goc.innerHTML = `
    <div class="dang-nhap">
        <section class="dn-trai"><div class="dn-noi">
            <img src="logo.png" alt="Biểu trưng ngành Tuyên giáo">
            <small>Ban Tuyên giáo Tỉnh ủy Tuyên Quang</small>
            <h1>Hồ sơ cán bộ, công chức</h1>
            <p>Cán bộ tự khai và cập nhật hồ sơ của mình theo Mẫu 2C-BNV/2008. Văn phòng Ban theo dõi, tổng hợp toàn bộ hồ sơ của cơ quan.</p>
        </div></section>
        <section class="dn-phai"><div class="dn-noi">
            <div class="tab" role="tablist">
                <button type="button" role="tab" aria-selected="true" data-tab="dn">Đăng nhập</button>
                <button type="button" role="tab" aria-selected="false" data-tab="dk">Đăng ký tài khoản</button>
            </div>
            ${loi ? `<div class="loi" style="margin-bottom:14px">${esc(loi)}</div>` : ''}
            ${tb ? `<div class="tb" style="margin-bottom:14px">${esc(tb)}</div>` : ''}
            <form id="f-dn" novalidate>
                <label class="o"><span>Mã cán bộ</span><input name="ma" autocomplete="username" autocapitalize="characters" placeholder="Ví dụ: CV01" required></label>
                <label class="o"><span>Mật khẩu</span><input name="mk" type="password" autocomplete="current-password" required></label>
                <div class="loi an" data-loi></div>
                <button class="nut nut-chinh" type="submit">Đăng nhập</button>
                <small style="color:var(--mo)">Quên mật khẩu: liên hệ Văn phòng Ban để được đặt lại.</small>
            </form>
            <form id="f-dk" class="an" novalidate>
                <div class="luoi-o" style="grid-template-columns:1fr 1fr">
                    <label class="o"><span>Mã cán bộ <em>*</em></span><input name="ma" autocapitalize="characters" placeholder="Ví dụ: CV12" required></label>
                    <label class="o"><span>Họ và tên <em>*</em></span><input name="ho_ten" autocomplete="name" required></label>
                </div>
                <label class="o"><span>Chức vụ</span><select name="chuc_vu">${DS_CHUC_VU.map(x => `<option${x === 'Chuyên viên' ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
                <label class="o"><span>Đơn vị công tác</span><select name="don_vi">${DS_DON_VI.map(x => `<option>${esc(x)}</option>`).join('')}</select></label>
                <div class="luoi-o" style="grid-template-columns:1fr 1fr">
                    <label class="o"><span>Mật khẩu <em>*</em></span><input name="mk" type="password" autocomplete="new-password" required><small>Ít nhất 6 ký tự</small></label>
                    <label class="o"><span>Nhập lại mật khẩu <em>*</em></span><input name="mk2" type="password" autocomplete="new-password" required></label>
                </div>
                <div class="loi an" data-loi></div>
                <button class="nut nut-chinh" type="submit">Gửi yêu cầu đăng ký</button>
                <small style="color:var(--mo)">Tài khoản dùng được sau khi quản trị viên phê duyệt.</small>
            </form>
        </div></section>
    </div>`;

    $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
        $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
        $('#f-dn').classList.toggle('an', b.dataset.tab !== 'dn');
        $('#f-dk').classList.toggle('an', b.dataset.tab !== 'dk');
    }));

    const baoLoi = (form, msg) => { const el = $('[data-loi]', form); el.textContent = msg; el.classList.toggle('an', !msg); };

    $('#f-dn').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target, nut = $('[type=submit]', form);
        const ma = form.ma.value.trim().toUpperCase(), mk = form.mk.value;
        if (!ma || !mk) return baoLoi(form, 'Nhập đủ mã cán bộ và mật khẩu.');
        nut.disabled = true; baoLoi(form, '');
        try {
            const email = await q(sb.rpc('hs_tim_email', { p_ma: ma }));
            if (!email) { nut.disabled = false; return baoLoi(form, 'Không tìm thấy mã cán bộ này. Kiểm tra lại hoặc đăng ký tài khoản.'); }
            const { data, error } = await sb.auth.signInWithPassword({ email, password: mk });
            if (error) throw error;
            await napTaiKhoan(data.session);
        } catch (err) { nut.disabled = false; baoLoi(form, dichLoi(err)); }
    });

    $('#f-dk').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target, nut = $('[type=submit]', form);
        const ma = form.ma.value.trim().toUpperCase(), ten = form.ho_ten.value.trim().replace(/\s+/g, ' ');
        if (!ma || !ten || !form.mk.value) return baoLoi(form, 'Nhập đủ các ô có dấu *.');
        if (!/^[A-Z0-9._-]{2,20}$/.test(ma)) return baoLoi(form, 'Mã cán bộ chỉ gồm chữ không dấu, số, dấu chấm hoặc gạch; dài 2–20 ký tự.');
        if (form.mk.value.length < 6) return baoLoi(form, 'Mật khẩu phải có ít nhất 6 ký tự.');
        if (form.mk.value !== form.mk2.value) return baoLoi(form, 'Hai lần nhập mật khẩu không khớp.');
        nut.disabled = true; baoLoi(form, '');
        try {
            if (await q(sb.rpc('hs_ma_da_dang_ky', { p_ma: ma }))) throw new Error('already registered');
            const { data, error } = await sb.auth.signUp({
                email: emailTuMa(ma), password: form.mk.value,
                options: { data: { app: 'hoso-cbcc', ma_cbcc: ma, ho_ten: ten, chuc_vu: form.chuc_vu.value, don_vi: form.don_vi.value } },
            });
            if (error) throw error;
            if (data.session) await sb.auth.signOut();
            manDangNhap('', `Đã gửi yêu cầu đăng ký cho mã ${ma}. Khi quản trị viên phê duyệt, bạn đăng nhập bằng mã này.`);
        } catch (err) { nut.disabled = false; baoLoi(form, dichLoi(err)); }
    });
    $('#f-dn [name=ma]').focus();
}

async function napTaiKhoan(session) {
    const tk = (await q(sb.from('hs_tai_khoan').select('*').eq('user_id', session.user.id)))[0];
    if (!tk) { await sb.auth.signOut(); return manDangNhap('Tài khoản này không thuộc hệ thống hồ sơ.'); }
    if (tk.trang_thai !== 'Hoạt động') { await sb.auth.signOut(); return manDangNhap('', 'Tài khoản đang chờ quản trị viên phê duyệt.'); }
    S.session = session; S.tk = tk; S.admin = tk.vai_tro === 'Admin';
    S.hoSoCuaToi = (await q(sb.from('hs_ho_so').select('id').eq('user_id', session.user.id)))[0]?.id || null;
    dungKhung();
    dinhTuyen();
}

async function dangXuat() {
    if (S.chuaLuu && !confirm('Bạn có thay đổi chưa lưu. Vẫn đăng xuất?')) return;
    S.chuaLuu = false;
    await sb.auth.signOut();
    history.replaceState(null, '', location.pathname);
    manDangNhap();
}

// ─────────────────────────────────────────────────────────
// 5. KHUNG GIAO DIỆN & ĐIỀU HƯỚNG
// ─────────────────────────────────────────────────────────
function mucMenu() {
    return S.admin ? [
        { id: 'tong-quan', n: 'Tổng quan', i: ICON.tq },
        { id: 'danh-sach', n: 'Danh sách', i: ICON.ds },
        { id: 'canh-bao', n: 'Cảnh báo', i: ICON.cb },
        { id: 'tai-khoan', n: 'Tài khoản', i: ICON.tk, dem: true },
        { id: 'cua-toi', n: 'Hồ sơ của tôi', i: ICON.hs },
    ] : [
        { id: 'cua-toi', n: 'Hồ sơ của tôi', i: ICON.hs },
        { id: 'doi-mat-khau', n: 'Đổi mật khẩu', i: ICON.mk },
    ];
}

function dungKhung() {
    const menu = mucMenu();
    goc.innerHTML = `
    <header class="thanh-tren"><img src="logo.png" alt=""><b>Hồ sơ cán bộ, công chức</b>
        ${S.admin ? `<a class="nut nut-nhe nut-nho" href="#/doi-mat-khau" aria-label="Đổi mật khẩu">${ICON.mk.replace('<svg', '<svg width="20" height="20"')}</a>` : ''}
        <button class="nut nut-nhe nut-nho" type="button" data-ra aria-label="Đăng xuất">${ICON.ra.replace('<svg', '<svg width="20" height="20"')}</button></header>
    <div class="khung">
        <aside class="thanh-ben">
            <div class="thuong-hieu"><img src="logo.png" alt=""><div><b>Hồ sơ cán bộ, công chức</b><small>Ban Tuyên giáo Tỉnh ủy</small></div></div>
            <nav class="menu">${menu.map(m => `<a href="#/${m.id}" data-m="${m.id}">${m.i.replace('<svg', '<svg width="20" height="20"')}${esc(m.n)}${m.dem ? '<span class="so-dem an" data-dem></span>' : ''}</a>`).join('')}</nav>
            <div class="nguoi-dung">
                <b>${esc(S.tk.ho_ten)}</b><small>Mã ${esc(S.tk.ma_cbcc)}, ${S.admin ? 'quản trị viên' : 'cán bộ'}</small>
                <div class="nhom-nut">${S.admin ? '<a class="nut nut-nho" href="#/doi-mat-khau">Đổi mật khẩu</a>' : ''}<button class="nut nut-nho" type="button" data-ra>Đăng xuất</button></div>
            </div>
        </aside>
        <main class="chinh" id="trang"></main>
    </div>
    <nav class="thanh-duoi">${menu.map(m => `<a href="#/${m.id}" data-m="${m.id}">${m.i}<span>${esc(m.n)}</span></a>`).join('')}</nav>`;
    $$('[data-ra]').forEach(b => b.addEventListener('click', dangXuat));
    if (S.admin) capNhatSoChoDuyet();
}

async function capNhatSoChoDuyet() {
    try {
        const { count } = await sb.from('hs_tai_khoan').select('user_id', { count: 'exact', head: true }).eq('trang_thai', 'Chờ duyệt');
        $$('[data-dem]').forEach(el => { el.textContent = count || ''; el.classList.toggle('an', !count); });
    } catch (_) { /* bỏ qua */ }
}

async function dinhTuyen() {
    if (!S.tk) return;
    if (S.chuaLuu && location.hash !== S.hashCu) {
        if (!confirm('Bạn có thay đổi chưa lưu. Rời khỏi trang này?')) { history.replaceState(null, '', S.hashCu); return; }
        S.chuaLuu = false;
    }
    S.hashCu = location.hash;
    const duong = location.hash.replace(/^#\/?/, '') || (S.admin ? 'tong-quan' : 'cua-toi');
    const [p0, p1, p2] = duong.split('/');
    const dangMo = (p0 === 'ho-so' && p1 === S.hoSoCuaToi) ? 'cua-toi' : (p0 === 'ho-so' ? 'danh-sach' : p0);
    $$('[data-m]').forEach(a => a.classList.toggle('dang-mo', a.dataset.m === dangMo));
    huyBieuDo();
    const trang = $('#trang');
    trang.innerHTML = '<div class="dang-tai">Đang tải…</div>';
    window.scrollTo(0, 0);
    try {
        if (p0 === 'tong-quan' && S.admin) await trangTongQuan(trang);
        else if (p0 === 'danh-sach' && S.admin) await trangDanhSach(trang);
        else if (p0 === 'tai-khoan' && S.admin) await trangTaiKhoan(trang);
        else if (p0 === 'canh-bao' && S.admin) await trangCanhBao(trang);
        else if (p0 === 'ho-so' && p1) await (p2 === 'sua' ? trangSua(trang, p1) : trangHoSo(trang, p1));
        else if (p0 === 'doi-mat-khau') trangDoiMatKhau(trang);
        else if (S.hoSoCuaToi) await trangHoSo(trang, S.hoSoCuaToi);
        else trang.innerHTML = `<div class="dau-trang"><div><h1>Hồ sơ của tôi</h1></div></div>
            <div class="tam"><p>Tài khoản này chưa gắn với hồ sơ nào.</p>
            ${S.admin ? '<p>Vào <a href="#/danh-sach">Danh sách</a> để tạo hồ sơ cho mình, dùng đúng mã cán bộ của tài khoản.</p>' : '<p>Liên hệ Văn phòng Ban để được gắn hồ sơ.</p>'}</div>`;
    } catch (e) {
        console.error(e);
        trang.innerHTML = `<div class="tam"><div class="loi">${esc(dichLoi(e))}</div><p style="margin-top:12px"><button class="nut" type="button" onclick="location.reload()">Tải lại trang</button></p></div>`;
    }
}
window.addEventListener('hashchange', dinhTuyen);
window.addEventListener('beforeunload', e => { if (S.chuaLuu) { e.preventDefault(); e.returnValue = ''; } });

// ─────────────────────────────────────────────────────────
// 6. DỮ LIỆU DANH SÁCH
// ─────────────────────────────────────────────────────────
async function napDanhSach(lamMoi = false) {
    if (S.ds && !lamMoi) return S.ds;
    const [hs, ct, dt] = await Promise.all([
        q(sb.from('hs_ho_so').select('*')),
        q(sb.from('hs_cong_tac').select('ho_so_id')),
        q(sb.from('hs_dao_tao').select('ho_so_id')),
    ]);
    const coCT = new Set(ct.map(r => r.ho_so_id)), coDT = new Set(dt.map(r => r.ho_so_id));
    hs.forEach(r => { r._ht = hoanThien(r, coCT.has(r.id), coDT.has(r.id)); });
    hs.sort((a, b) => thuTuDs(DS_DON_VI, a.don_vi) - thuTuDs(DS_DON_VI, b.don_vi)
        || thuTuDs(DS_CHUC_VU, a.chuc_vu) - thuTuDs(DS_CHUC_VU, b.chuc_vu)
        || a.ho_ten.localeCompare(b.ho_ten, 'vi'));
    S.ds = hs;
    return hs;
}

const vach = (p) => `<div class="vach" style="--p:${p}%;${p >= 100 ? '--mau:var(--xanh)' : ''}"><i></i><span>${p}%</span></div>`;
const anhNho = (r, url) => url ? `<img class="anh-nho" src="${esc(url)}" alt="">` : `<div class="anh-nho chu" data-anh="${esc(r.anh_the || '')}">${esc(chuDau(r.ho_ten))}</div>`;

async function gangAnhNho(vung, ds) {
    const lay = await layAnh(ds.map(r => r.anh_the));
    $$('[data-anh]', vung).forEach(el => {
        const url = lay(el.dataset.anh);
        if (url) { const img = new Image(); img.className = 'anh-nho'; img.alt = ''; img.src = url; el.replaceWith(img); }
    });
}

// ─────────────────────────────────────────────────────────
// 7. TÍNH TOÁN DÙNG CHUNG: nghỉ hưu, thời hạn, phân nhóm
// ─────────────────────────────────────────────────────────
const homNayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const congThang = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(y, m - 1 + n, 1); const cuoi = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(Math.min(d, cuoi)).padStart(2, '0')}`; };
const soNgayDen = iso => Math.round((new Date(iso + 'T00:00:00') - new Date(homNayISO() + 'T00:00:00')) / 864e5);
const chuTuoi = t => `${Math.floor(t / 12)} tuổi${t % 12 ? ` ${t % 12} tháng` : ''}`;

// Tuổi nghỉ hưu theo lộ trình Nghị định 135/2020/NĐ-CP. Thời điểm nghỉ hưu: ngày 01 của tháng liền sau tháng đủ tuổi.
function nghiHuu(ngaySinh, gioiTinh) {
    if (!ngaySinh || !['Nam', 'Nữ'].includes(gioiTinh)) return null;
    const [y, m] = String(ngaySinh).split('-').map(Number);
    const nam = gioiTinh === 'Nam';
    const can = Y => Y <= 2020 ? (nam ? 720 : 660) : nam ? Math.min(720 + 3 * (Y - 2020), 744) : Math.min(660 + 4 * (Y - 2020), 720);
    for (let Y = 2020; Y <= 2100; Y++) {
        const thangDu = y * 12 + (m - 1) + can(Y);
        if (Math.floor(thangDu / 12) <= Y) {
            const t = thangDu + 1;
            return { tuoi: can(Y), ngay: `${Math.floor(t / 12)}-${String(t % 12 + 1).padStart(2, '0')}-01` };
        }
    }
    return null;
}

// Thời hạn kỷ luật gợi ý (tháng). Chính quyền: Luật CBCC sửa đổi 2019, Điều 82. Đảng: theo hướng dẫn hiện hành — Admin sửa được.
const THOI_HAN_KL = {
    'Chính quyền': { 'Khiển trách': 12, 'Cảnh cáo': 12, 'Hạ bậc lương': 12, 'Giáng chức': 24, 'Cách chức': 24, 'Buộc thôi việc': null },
    'Đảng': { 'Khiển trách': 12, 'Cảnh cáo': 30, 'Cách chức': 60, 'Khai trừ': null },
};

function trongKhoang(iso, khoang) {
    if (!iso) return false;
    if (khoang === 'tat-ca') return true;
    const hn = homNayISO();
    if (khoang === 'qua-han') return iso < hn;
    if (/^q\d+$/.test(khoang)) return iso <= congThang(hn, Number(khoang.slice(1)));
    if (khoang.startsWith('nam-')) return iso.startsWith(khoang.slice(4));
    return true;
}
const moTaKhoang = khoang => {
    const hn = homNayISO();
    if (khoang === 'tat-ca') return '';
    if (khoang === 'qua-han') return `(Các trường hợp đã quá hạn tính đến ngày ${ngayVN(hn)})`;
    if (/^q\d+$/.test(khoang)) return `(Từ nay đến ngày ${ngayVN(congThang(hn, Number(khoang.slice(1))))}, kể cả trường hợp đã quá hạn)`;
    if (khoang.startsWith('nam-')) return `(Năm ${khoang.slice(4)})`;
    return '';
};

function phanLoaiTrinhDo(r) {
    const hv = boDau(r.hoc_vi), cm = boDau(r.trinh_do_chuyen_mon);
    if (/tien si/.test(hv) || /tien si/.test(cm)) return 'Tiến sĩ';
    if (/thac s[iy]/.test(hv) || /thac s[iy]/.test(cm)) return 'Thạc sĩ';
    if (/dai hoc|cu nhan|ky su|bac si/.test(cm + ' ' + hv)) return 'Đại học';
    if (/cao dang/.test(cm)) return 'Cao đẳng';
    if (/trung cap/.test(cm)) return 'Trung cấp';
    if (/so cap/.test(cm)) return 'Sơ cấp';
    return trong(r.trinh_do_chuyen_mon) ? 'Chưa khai' : 'Khác';
}
const nhomTuoi = t => t === null ? 'Chưa khai' : t < 30 ? 'Dưới 30' : t <= 40 ? '30–40' : t <= 50 ? '41–50' : t <= 60 ? '51–60' : 'Trên 60';
const nhomHeSo = h => h === null || h === undefined ? 'Chưa có' : h < 3 ? 'Dưới 3,0' : h < 4 ? '3,0–3,99' : h < 5 ? '4,0–4,99' : h < 6 ? '5,0–5,99' : 'Từ 6,0';

const TEN_NGACH = { CVCC: 'Chuyên viên cao cấp', CVC: 'Chuyên viên chính', CV: 'Chuyên viên' };
const chuanNgach = t => { if (trong(t)) return null; const k = String(t).trim(); return TEN_NGACH[k.toUpperCase()] || k.charAt(0).toUpperCase() + k.slice(1); };

function gomNhom(ds, layNhan, thuTu = null, giuTrong = false) {
    const m = new Map();
    (thuTu || []).forEach(k => m.set(k, []));
    ds.forEach(r => { const k = layNhan(r) || 'Chưa khai'; if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
    if (!thuTu) return new Map([...m].sort((a, b) => (a[0] === 'Chưa khai') - (b[0] === 'Chưa khai') || b[1].length - a[1].length));
    return giuTrong ? m : new Map([...m].filter(([, v]) => v.length));
}

async function napToanBo() {
    const [ds, nl, kt] = await Promise.all([
        napDanhSach(true),
        sb.from('hs_nang_luong').select('*').then(r => { if (r.error) throw r.error; return r.data; }),
        q(sb.from('hs_khen_thuong').select('*')),
    ]);
    const theoId = Object.fromEntries(ds.map(r => [r.id, r]));
    const nlTheoHs = {};
    nl.forEach(r => { if (r.ho_so_id) nlTheoHs[r.ho_so_id] = r; });
    ds.forEach(r => {
        r._tuoi = tuoi(r.ngay_sinh);
        r._nh = nghiHuu(r.ngay_sinh, r.gioi_tinh);
        r._nl = nlTheoHs[r.id] || null;
        r._heSo = r._nl?.he_so ?? r.he_so_luong ?? null;
    });
    kt.forEach(k => { k._hs = theoId[k.ho_so_id]; });
    const hn = homNayISO();
    const klConHan = kt.filter(k => k.loai === 'Kỷ luật' && k._hs && k.ngay_het_han && k.ngay_het_han >= hn);
    return { ds, nl, kt, theoId, klConHan };
}

// ─────────────────────────────────────────────────────────
// 8. BIỂU ĐỒ
// ─────────────────────────────────────────────────────────
const MAU = ['#C8102E', '#0D1B2A', '#F5A623', '#5B6B80', '#8E1B2E', '#E8C47A', '#2F7D4A', '#9AA3AE', '#C9B99A'];
S.bieuDo = [];
function huyBieuDo() { S.bieuDo.forEach(c => c.destroy()); S.bieuDo = []; }

function veBieuDo(canvas, { kieu, nhom, ngang = false, nhanBo = null, xepChong = false }, moDanhSach) {
    if (!window.Chart) { canvas.replaceWith(Object.assign(document.createElement('p'), { className: 'trong', textContent: 'Không tải được thư viện biểu đồ. Kiểm tra mạng rồi tải lại trang.' })); return; }
    const nhan = [...nhom.keys()];
    const boDuLieu = nhanBo
        ? nhanBo.map((b, i) => ({ label: b.n, data: nhan.map(k => nhom.get(k).filter(b.loc).length), backgroundColor: b.mau || MAU[i], borderRadius: 3 }))
        : [{ data: nhan.map(k => nhom.get(k).length),
             backgroundColor: kieu === 'doughnut' ? nhan.map((k, i) => k === 'Chưa khai' || k === 'Chưa có' ? '#D9D2BF' : MAU[i % MAU.length]) : nhan.map(k => k === 'Chưa khai' || k === 'Chưa có' ? '#D9D2BF' : '#C8102E'),
             borderColor: kieu === 'doughnut' ? '#FFFDF7' : undefined, borderWidth: kieu === 'doughnut' ? 2 : 0, borderRadius: kieu === 'doughnut' ? 0 : 3 }];
    const c = new Chart(canvas, {
        type: kieu,
        data: { labels: nhan, datasets: boDuLieu },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: ngang ? 'y' : 'x',
            animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 500 },
            cutout: kieu === 'doughnut' ? '58%' : undefined,
            plugins: {
                legend: { display: kieu === 'doughnut' || !!nhanBo, position: kieu === 'doughnut' ? 'right' : 'top',
                    labels: { boxWidth: 12, font: { family: 'Be Vietnam Pro', size: 12 }, color: '#3A4656' } },
                tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label ? ctx.dataset.label + ': ' : ''}${ctx.raw} người` } },
            },
            scales: kieu === 'doughnut' ? {} : {
                x: { stacked: xepChong, grid: { display: ngang }, ticks: { font: { family: 'Be Vietnam Pro', size: 11 }, color: '#3A4656', precision: 0 } },
                y: { stacked: xepChong, grid: { display: !ngang, color: '#EEE5CB' }, ticks: { font: { family: 'Be Vietnam Pro', size: 11 }, color: '#3A4656', precision: 0 } },
            },
            onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; },
            onClick: (e, el) => {
                if (!el.length || !moDanhSach) return;
                const k = nhan[el[0].index];
                const b = nhanBo ? nhanBo[el[0].datasetIndex] : null;
                moDanhSach(b ? `${k} — ${b.n}` : k, b ? nhom.get(k).filter(b.loc) : nhom.get(k));
            },
        },
    });
    S.bieuDo.push(c);
}

function hopDanhSach(tieuDe, ds, moTa = r => r.chuc_vu || '') {
    hopThoai({
        tieuDe: `${tieuDe} (${ds.length})`, nutPhu: '', nutChinh: 'Đóng',
        noiDung: ds.length ? `<div class="cuon-ngang"><table class="bang"><tbody>${ds.map((r, i) => {
            const h = r._hs || r;
            return `<tr><td class="so">${i + 1}</td><td><a href="#/ho-so/${h.id}" data-dong>${esc(h.ho_ten)}</a><br><small style="color:var(--mo)">${esc(moTa(r))}</small></td><td>${esc(h.don_vi || '')}</td></tr>`;
        }).join('')}</tbody></table></div>` : '<p class="trong">Không có ai.</p>',
        sauKhiMo: (form, dong) => $$('[data-dong]', form).forEach(a => a.addEventListener('click', () => dong(null))),
    });
}

// ─────────────────────────────────────────────────────────
// 9. TRANG TỔNG QUAN — DASHBOARD (Admin)
// ─────────────────────────────────────────────────────────
async function trangTongQuan(trang) {
    let du;
    try { du = await napToanBo(); }
    catch (e) { if (/hs_nang_luong/.test(e.message || '')) throw new Error('Chưa chạy file sql/02_giai_doan_2.sql trong Supabase.'); throw e; }
    const { ds, kt, klConHan } = du;
    const choDuyet = await q(sb.from('hs_tai_khoan').select('user_id').eq('trang_thai', 'Chờ duyệt'));
    const nam = ds.filter(r => r.gioi_tinh === 'Nam').length, nu = ds.filter(r => r.gioi_tinh === 'Nữ').length;
    const dangVien = ds.filter(r => r.ngay_vao_dang);
    const coTuoi = ds.filter(r => r._tuoi !== null);
    const tuoiBQ = coTuoi.length ? (coTuoi.reduce((s, r) => s + r._tuoi, 0) / coTuoi.length).toFixed(1).replace('.', ',') : '—';
    const hn = homNayISO();
    const canNL = ds.filter(r => r._nl?.ngay_du_kien && trongKhoang(r._nl.ngay_du_kien, 'q3')).length;
    const canNH = ds.filter(r => r._nh && r._nh.ngay >= hn && trongKhoang(r._nh.ngay, 'q12')).length;
    const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
    const canBoSung = [...ds].sort((a, b) => a._ht.p - b._ht.p).filter(r => r._ht.p < 80).slice(0, 10);

    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Tổng quan cán bộ, công chức</h1><p>Số liệu lúc ${new Date().toLocaleString('vi-VN')}. Bấm vào cột hoặc phần biểu đồ để xem danh sách.</p></div>
        ${choDuyet.length ? `<a class="nut" href="#/tai-khoan">${choDuyet.length} tài khoản chờ duyệt</a>` : ''}</div>
    <div class="chi-so bon">
        <a href="#/danh-sach"><b>${ds.length}</b><span>cán bộ, công chức (${nam} nam, ${nu} nữ)</span></a>
        <a href="#/tong-quan" data-xem="dang"><b>${dangVien.length}</b><span>đảng viên, chiếm ${pct(dangVien.length, ds.length)}%</span></a>
        <a href="#/tong-quan" data-xem="tuoi"><b>${tuoiBQ}</b><span>tuổi bình quân (${coTuoi.length} người đã khai ngày sinh)</span></a>
        <a href="#/canh-bao" class="${canNL + canNH + klConHan.length ? 'can-xu-ly' : ''}"><b>${canNL + canNH}</b><span>cảnh báo: ${canNL} nâng lương trong 3 tháng, ${canNH} nghỉ hưu trong 12 tháng</span></a>
    </div>
    <div class="luoi-bd">
        <section class="tam"><h2>Giới tính</h2><div class="khung-bd"><canvas data-bd="gt"></canvas></div></section>
        <section class="tam"><h2>Độ tuổi</h2><div class="khung-bd"><canvas data-bd="tuoi"></canvas></div></section>
        <section class="tam"><h2>Trình độ chuyên môn</h2><div class="khung-bd"><canvas data-bd="cm"></canvas></div></section>
        <section class="tam"><h2>Học vị</h2><div class="khung-bd"><canvas data-bd="hv"></canvas></div></section>
        <section class="tam"><h2>Lý luận chính trị</h2><div class="khung-bd"><canvas data-bd="llct"></canvas></div></section>
        <section class="tam"><h2>Đảng viên</h2><div class="khung-bd"><canvas data-bd="dang"></canvas></div></section>
        <section class="tam"><h2>Ngạch công chức</h2><div class="khung-bd cao"><canvas data-bd="ngach"></canvas></div></section>
        <section class="tam"><h2>Số người theo đơn vị</h2><div class="khung-bd cao"><canvas data-bd="dv"></canvas></div></section>
        <section class="tam"><h2>Dân tộc</h2><div class="khung-bd"><canvas data-bd="dt"></canvas></div></section>
        <section class="tam"><h2>Hệ số lương <small>Ưu tiên số liệu app nâng lương</small></h2><div class="khung-bd"><canvas data-bd="hs"></canvas></div></section>
        <section class="tam rong"><h2>Khen thưởng, kỷ luật theo năm</h2><div class="khung-bd"><canvas data-bd="ktnam"></canvas></div></section>
        <section class="tam rong"><h2>Khen thưởng, kỷ luật theo đơn vị</h2><div class="khung-bd"><canvas data-bd="ktdv"></canvas></div></section>
    </div>
    <section class="tam"><h2>Kỷ luật còn trong thời hạn <small>${klConHan.length} trường hợp</small></h2>
        ${klConHan.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Cán bộ</th><th>Đơn vị</th><th>Hình thức</th><th>Ngày quyết định</th><th>Hết thời hạn</th></tr></thead><tbody>
        ${klConHan.sort((a, b) => a.ngay_het_han.localeCompare(b.ngay_het_han)).map(k => `<tr class="bam" data-id="${k._hs.id}"><td><b>${esc(k._hs.ho_ten)}</b></td><td data-nhan="Đơn vị">${esc(k._hs.don_vi || '')}</td>
            <td data-nhan="Hình thức">${esc([k.hinh_thuc, k.he_thong && `(${k.he_thong})`].filter(Boolean).join(' ') || 'Chưa ghi')}</td><td data-nhan="Ngày QĐ">${esc(ngayVN(k.ngay_quyet_dinh))}</td>
            <td data-nhan="Hết thời hạn"><b>${esc(ngayVN(k.ngay_het_han))}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="trong">Không có ai đang trong thời hạn kỷ luật.</p>'}
    </section>
    <section class="tam"><h2>Hồ sơ cần bổ sung <small>Khai dưới 80%, xếp từ ít nhất</small></h2>
        ${canBoSung.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Cán bộ</th><th>Đơn vị</th><th>Đã khai</th><th>Còn thiếu</th></tr></thead><tbody>
        ${canBoSung.map(r => `<tr class="bam" data-id="${r.id}"><td><div class="ten-ds">${anhNho(r)}<div><b>${esc(r.ho_ten)}</b><small>${esc(r.chuc_vu || '')}</small></div></div></td>
            <td data-nhan="Đơn vị">${esc(r.don_vi || '')}</td><td>${vach(r._ht.p)}</td>
            <td data-nhan="Còn thiếu">${esc(r._ht.thieu.slice(0, 3).join(', '))}${r._ht.thieu.length > 3 ? ` và ${r._ht.thieu.length - 3} mục khác` : ''}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="trong">Tất cả hồ sơ đã khai từ 80% trở lên.</p>'}
        ${ds.filter(r => r._ht.p < 80).length > 10 ? `<p style="margin:10px 0 0"><a href="#/danh-sach" data-loc-chua>Xem tất cả ${ds.filter(r => r._ht.p < 80).length} hồ sơ khai dưới 80%</a></p>` : ''}
    </section>`;

    const bd = k => $(`[data-bd="${k}"]`, trang);
    const xem = (t, d) => hopDanhSach(t, d);
    veBieuDo(bd('gt'), { kieu: 'doughnut', nhom: gomNhom(ds, r => r.gioi_tinh, ['Nam', 'Nữ', 'Chưa khai']) }, xem);
    veBieuDo(bd('tuoi'), { kieu: 'bar', nhom: gomNhom(ds, r => nhomTuoi(r._tuoi), ['Dưới 30', '30–40', '41–50', '51–60', 'Trên 60', 'Chưa khai']) }, (t, d) => hopDanhSach(t, d, r => r._tuoi !== null ? `${r._tuoi} tuổi` : 'Chưa khai ngày sinh'));
    veBieuDo(bd('cm'), { kieu: 'bar', nhom: gomNhom(ds, phanLoaiTrinhDo, ['Tiến sĩ', 'Thạc sĩ', 'Đại học', 'Cao đẳng', 'Trung cấp', 'Sơ cấp', 'Khác', 'Chưa khai']) }, (t, d) => hopDanhSach(t, d, r => r.trinh_do_chuyen_mon || ''));
    veBieuDo(bd('hv'), { kieu: 'doughnut', nhom: gomNhom(ds, r => r.hoc_vi) }, xem);
    veBieuDo(bd('llct'), { kieu: 'bar', nhom: gomNhom(ds, r => r.ly_luan_chinh_tri, [...DS_LY_LUAN, 'Chưa khai']) }, xem);
    veBieuDo(bd('dang'), { kieu: 'doughnut', nhom: gomNhom(ds, r => r.ngay_vao_dang ? 'Đảng viên' : 'Chưa khai ngày vào Đảng', ['Đảng viên', 'Chưa khai ngày vào Đảng']) }, (t, d) => hopDanhSach(t, d, r => r.ngay_vao_dang ? `Vào Đảng ${ngayVN(r.ngay_vao_dang)}` : ''));
    veBieuDo(bd('ngach'), { kieu: 'bar', ngang: true, nhom: gomNhom(ds, r => chuanNgach(r.ngach_cong_chuc) || chuanNgach(r._nl?.ngach_luong)) }, xem);
    veBieuDo(bd('dv'), { kieu: 'bar', ngang: true, nhom: gomNhom(ds, r => DS_DON_VI.includes(r.don_vi) ? r.don_vi : (r.don_vi ? 'Khác' : null), [...DS_DON_VI, 'Khác', 'Chưa khai']) }, xem);
    veBieuDo(bd('dt'), { kieu: 'doughnut', nhom: gomNhom(ds, r => r.dan_toc) }, xem);
    veBieuDo(bd('hs'), { kieu: 'bar', nhom: gomNhom(ds, r => nhomHeSo(r._heSo), ['Dưới 3,0', '3,0–3,99', '4,0–4,99', '5,0–5,99', 'Từ 6,0', 'Chưa có']) }, (t, d) => hopDanhSach(t, d, r => r._heSo ? `Hệ số ${soVN(r._heSo)}` : 'Chưa có hệ số'));

    // Khen thưởng, kỷ luật
    const ktCo = kt.filter(k => k._hs);
    const nam10 = new Date().getFullYear();
    const thuTuNam = Array.from({ length: 10 }, (_, i) => String(nam10 - 9 + i));
    const ktTheoNam = gomNhom(ktCo.filter(k => k.ngay_quyet_dinh && String(k.ngay_quyet_dinh).slice(0, 4) >= thuTuNam[0]), k => String(k.ngay_quyet_dinh).slice(0, 4), thuTuNam, true);
    const ktTheoDv = gomNhom(ktCo, k => DS_DON_VI.includes(k._hs.don_vi) ? k._hs.don_vi : 'Khác', [...DS_DON_VI, 'Khác']);
    const boKT = [{ n: 'Khen thưởng', loc: k => k.loai === 'Khen thưởng', mau: '#F5A623' }, { n: 'Kỷ luật', loc: k => k.loai === 'Kỷ luật', mau: '#C8102E' }];
    const xemKT = (t, d) => hopDanhSach(t, d, k => [k.hinh_thuc, k.noi_dung, ngayVN(k.ngay_quyet_dinh)].filter(Boolean).join(' — '));
    veBieuDo(bd('ktnam'), { kieu: 'bar', nhom: ktTheoNam, nhanBo: boKT, xepChong: true }, xemKT);
    veBieuDo(bd('ktdv'), { kieu: 'bar', ngang: true, nhom: ktTheoDv.size ? ktTheoDv : new Map([['Chưa có dữ liệu', []]]), nhanBo: boKT }, xemKT);

    $$('tr[data-id]', trang).forEach(tr => tr.addEventListener('click', () => { location.hash = `#/ho-so/${tr.dataset.id}`; }));
    $('[data-loc-chua]', trang)?.addEventListener('click', () => { S.locDs.tt = 'chua'; });
    $('[data-xem="dang"]', trang).addEventListener('click', e => { e.preventDefault(); hopDanhSach('Đảng viên', dangVien, r => `Vào Đảng ${ngayVN(r.ngay_vao_dang)}`); });
    $('[data-xem="tuoi"]', trang).addEventListener('click', e => { e.preventDefault(); hopDanhSach('Cán bộ đã khai ngày sinh', [...coTuoi].sort((a, b) => b._tuoi - a._tuoi), r => `${r._tuoi} tuổi`); });
    gangAnhNho(trang, canBoSung);
}

// ─────────────────────────────────────────────────────────
// 10. TRANG CẢNH BÁO (Admin)
// ─────────────────────────────────────────────────────────
S.cb = { tab: 'nl', khoang: { nl: 'q3', nh: 'q12', kl: 'con-han' }, dv: '', loai: '' };

async function trangCanhBao(trang) {
    let du;
    try { du = await napToanBo(); }
    catch (e) { if (/hs_nang_luong/.test(e.message || '')) throw new Error('Chưa chạy file sql/02_giai_doan_2.sql trong Supabase.'); throw e; }
    const [ghep, dongBo] = await Promise.all([
        q(sb.from('hs_ghep_luong').select('*')),
        q(sb.from('hs_dong_bo').select('*').order('luc', { ascending: false }).limit(20)),
    ]);
    const { ds, nl, kt } = du;
    const hn = homNayISO();
    const boQua = new Set(ghep.filter(g => g.bo_qua).map(g => g.ten_chuan));
    const nlChuaGhep = nl.filter(r => !r.ho_so_id && !boQua.has(r.ten_chuan));
    const lanCuoi = dongBo[0];
    const namNay = new Date().getFullYear();

    const TAB = {
        nl: { ten: 'Nâng lương', khoang: [['q3', 'Đã quá hạn và 3 tháng tới'], ['q6', '6 tháng tới'], ['q12', '12 tháng tới'], ['qua-han', 'Đã quá hạn'], ...[0, 1, 2].map(i => [`nam-${namNay + i}`, `Năm ${namNay + i}`]), ['tat-ca', 'Tất cả']] },
        nh: { ten: 'Nghỉ hưu', khoang: [['q12', '12 tháng tới'], ['q6', '6 tháng tới'], ['q24', '24 tháng tới'], ...[0, 1, 2, 3].map(i => [`nam-${namNay + i}`, `Năm ${namNay + i}`]), ['tat-ca', 'Tất cả']] },
        kl: { ten: 'Kỷ luật còn thời hạn', khoang: [['con-han', 'Đang còn thời hạn'], ['het-3', 'Hết thời hạn trong 3 tháng tới']] },
        thieu: { ten: 'Chưa đủ dữ liệu' }, ghep: { ten: 'Ghép tên nâng lương' }, dongbo: { ten: 'Lịch sử đồng bộ' },
    };
    const locDv = r => !S.cb.dv || r.don_vi === S.cb.dv;

    const dsNL = () => ds.filter(r => r._nl?.ngay_du_kien && locDv(r) && trongKhoang(r._nl.ngay_du_kien, S.cb.khoang.nl) && (!S.cb.loai || r._nl.loai === S.cb.loai))
        .sort((a, b) => a._nl.ngay_du_kien.localeCompare(b._nl.ngay_du_kien));
    const dsNH = () => ds.filter(r => r._nh && r._nh.ngay >= hn && locDv(r) && trongKhoang(r._nh.ngay, S.cb.khoang.nh)).sort((a, b) => a._nh.ngay.localeCompare(b._nh.ngay));
    const dsKL = () => kt.filter(k => k.loai === 'Kỷ luật' && k._hs && k.ngay_het_han && k.ngay_het_han >= hn && locDv(k._hs)
        && (S.cb.khoang.kl !== 'het-3' || k.ngay_het_han <= congThang(hn, 3))).sort((a, b) => a.ngay_het_han.localeCompare(b.ngay_het_han));
    const thieuNS = ds.filter(r => !r._nh);
    const khongNL = ds.filter(r => !r._nl);
    const klThieuHan = kt.filter(k => k.loai === 'Kỷ luật' && k._hs && !k.ngay_het_han);

    const conLai = iso => { const n = soNgayDen(iso); return n < 0 ? `<span class="the-nho do">Quá ${-n} ngày</span>` : n === 0 ? '<span class="the-nho do">Hôm nay</span>' : n <= 31 ? `<span class="the-nho do">Còn ${n} ngày</span>` : `<span class="the-nho">Còn ${Math.round(n / 30.4)} tháng</span>`; };
    const bacHs = (bac, hs, vk) => [bac && `Bậc ${bac}`, hs && `HS ${soVN(hs)}`, vk && `VK ${vk}`].filter(Boolean).join(', ');

    // Cấu trúc bảng cho từng loại (dùng chung cho màn hình và file xuất)
    const BANG = {
        nl: () => ({
            tieuDe: 'Danh sách cán bộ, công chức đến hạn nâng lương', phuDe: moTaKhoang(S.cb.khoang.nl),
            cot: [{ n: 'TT', w: 1.1 }, { n: 'Họ và tên', w: 4.2, canh: 'trai' }, { n: 'Chức vụ, đơn vị', w: 5, canh: 'trai' }, { n: 'Ngạch (mã ngạch)', w: 3.6 },
                { n: 'Đang hưởng', w: 3.4 }, { n: 'Từ ngày', w: 2.4 }, { n: 'Đề nghị nâng', w: 3.4 }, { n: 'Từ ngày', w: 2.4 }, { n: 'Hình thức', w: 2.8 }],
            dong: dsNL().map((r, i) => { const n = r._nl; return [i + 1, r.ho_ten, [r.chuc_vu, r.don_vi].filter(Boolean).join(', '),
                `${chuanNgach(n.ngach_luong) || chuanNgach(r.ngach_cong_chuc) || ''}${n.ma_ngach ? ` (${n.ma_ngach})` : ''}`, bacHs(n.bac_luong, n.he_so, n.vuot_khung), ngayVN(n.ngay_gan_nhat),
                n.loai === 'vuot_khung' ? `PC TNVK ${n.vuot_khung_moi || ''}` : bacHs(n.bac_moi, n.he_so_moi), ngayVN(n.ngay_du_kien),
                n.loai === 'vuot_khung' ? 'Vượt khung' : 'Thường xuyên']; }),
            them: dsNL().map(r => conLai(r._nl.ngay_du_kien)), ids: dsNL().map(r => r.id),
        }),
        nh: () => ({
            tieuDe: 'Danh sách cán bộ, công chức đến tuổi nghỉ hưu', phuDe: [moTaKhoang(S.cb.khoang.nh), '(Tính theo lộ trình tuổi nghỉ hưu tại Nghị định số 135/2020/NĐ-CP)'].filter(Boolean).join(' '),
            cot: [{ n: 'TT', w: 1.1 }, { n: 'Họ và tên', w: 4.4, canh: 'trai' }, { n: 'Chức vụ', w: 4.2, canh: 'trai' }, { n: 'Đơn vị', w: 5, canh: 'trai' },
                { n: 'Ngày sinh', w: 2.6 }, { n: 'Giới tính', w: 1.9 }, { n: 'Tuổi nghỉ hưu', w: 3.2 }, { n: 'Thời điểm nghỉ hưu', w: 3 }],
            dong: dsNH().map((r, i) => [i + 1, r.ho_ten, r.chuc_vu || '', r.don_vi || '', ngayVN(r.ngay_sinh), r.gioi_tinh, chuTuoi(r._nh.tuoi), ngayVN(r._nh.ngay)]),
            them: dsNH().map(r => conLai(r._nh.ngay)), ids: dsNH().map(r => r.id),
        }),
        kl: () => ({
            tieuDe: 'Danh sách cán bộ, công chức đang trong thời hạn kỷ luật', phuDe: `(Tính đến ngày ${ngayVN(hn)})`,
            cot: [{ n: 'TT', w: 1.1 }, { n: 'Họ và tên', w: 4.2, canh: 'trai' }, { n: 'Chức vụ, đơn vị', w: 5, canh: 'trai' }, { n: 'Kỷ luật theo', w: 2.6 },
                { n: 'Hình thức', w: 2.8 }, { n: 'Quyết định số, ngày', w: 4 }, { n: 'Hết thời hạn', w: 2.6 }, { n: 'Nội dung', w: 5, canh: 'trai' }],
            dong: dsKL().map((k, i) => [i + 1, k._hs.ho_ten, [k._hs.chuc_vu, k._hs.don_vi].filter(Boolean).join(', '), k.he_thong || '', k.hinh_thuc || '',
                [k.quyet_dinh_so, ngayVN(k.ngay_quyet_dinh)].filter(Boolean).join(', '), ngayVN(k.ngay_het_han), k.noi_dung || '']),
            them: dsKL().map(k => conLai(k.ngay_het_han)), ids: dsKL().map(k => k._hs.id),
        }),
    };

    const soTab = { nl: ds.filter(r => r._nl?.ngay_du_kien && trongKhoang(r._nl.ngay_du_kien, 'q3')).length,
        nh: ds.filter(r => r._nh && r._nh.ngay >= hn && trongKhoang(r._nh.ngay, 'q12')).length,
        kl: kt.filter(k => k.loai === 'Kỷ luật' && k._hs && k.ngay_het_han >= hn).length,
        thieu: thieuNS.length + klThieuHan.length, ghep: nlChuaGhep.length };

    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Cảnh báo</h1>
        <p>${lanCuoi ? `Đồng bộ nâng lương lần cuối: ${new Date(lanCuoi.luc).toLocaleString('vi-VN')}${lanCuoi.thanh_cong ? '' : ' — <b style="color:var(--do)">không thành công</b>'}` : 'Chưa đồng bộ dữ liệu nâng lương lần nào.'}</p></div></div>
    <div class="tab" role="tablist">${Object.entries(TAB).map(([k, t]) => `<button type="button" role="tab" data-cbtab="${k}" aria-selected="${S.cb.tab === k}">${esc(t.ten)}${soTab[k] ? ` <span class="the-nho${k === 'ghep' || k === 'thieu' ? '' : ' do'}">${soTab[k]}</span>` : ''}</button>`).join('')}</div>
    <div data-vung-cb></div>`;

    const vung = $('[data-vung-cb]', trang);
    const ve = () => {
        $$('[data-cbtab]', trang).forEach(b => b.setAttribute('aria-selected', b.dataset.cbtab === S.cb.tab));
        const t = S.cb.tab;
        if (BANG[t]) {
            const b = BANG[t]();
            vung.innerHTML = `
            <div class="bo-loc">
                <label class="o hep"><span>Khoảng thời gian</span><select data-khoang>${TAB[t].khoang.map(([v, n]) => `<option value="${v}"${S.cb.khoang[t] === v ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
                <label class="o hep"><span>Đơn vị</span><select data-dvcb><option value="">Tất cả đơn vị</option>${DS_DON_VI.map(x => `<option${x === S.cb.dv ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
                ${t === 'nl' ? `<label class="o hep"><span>Hình thức</span><select data-loai><option value="">Tất cả</option><option value="thuong_xuyen"${S.cb.loai === 'thuong_xuyen' ? ' selected' : ''}>Nâng bậc thường xuyên</option><option value="vuot_khung"${S.cb.loai === 'vuot_khung' ? ' selected' : ''}>Phụ cấp vượt khung</option></select></label>` : ''}
            </div>
            <section class="tam">
                <h2>${esc(b.tieuDe)} <small>${b.dong.length} trường hợp ${esc(b.phuDe)}</small></h2>
                <div class="nhom-nut" style="margin-bottom:12px"><button class="nut nut-nho" type="button" data-xuat="excel">Xuất Excel</button><button class="nut nut-nho" type="button" data-xuat="word">Xuất Word</button></div>
                ${b.dong.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr>${b.cot.map(c => `<th>${esc(c.n)}</th>`).join('')}<th></th></tr></thead><tbody>
                ${b.dong.map((d, i) => `<tr class="bam" data-id="${b.ids[i]}">${d.map((v, j) => `<td data-nhan="${esc(b.cot[j].n)}"${j === 0 ? ' class="so"' : ''}>${j === 1 ? `<b>${esc(v)}</b>` : esc(v)}</td>`).join('')}<td>${b.them[i]}</td></tr>`).join('')}
                </tbody></table></div>` : `<p class="trong">Không có trường hợp nào trong khoảng thời gian này.${t === 'nl' && !nl.length ? ' Dữ liệu nâng lương chưa được đồng bộ, xem tab Lịch sử đồng bộ.' : ''}</p>`}
            </section>`;
            $('[data-khoang]', vung).addEventListener('change', e => { S.cb.khoang[t] = e.target.value; ve(); });
            $('[data-dvcb]', vung).addEventListener('change', e => { S.cb.dv = e.target.value; ve(); });
            $('[data-loai]', vung)?.addEventListener('change', e => { S.cb.loai = e.target.value; ve(); });
            $$('tr[data-id]', vung).forEach(tr => tr.addEventListener('click', () => { location.hash = `#/ho-so/${tr.dataset.id}`; }));
            $$('[data-xuat]', vung).forEach(nut => nut.addEventListener('click', () => xuatDanhSach(nut.dataset.xuat, BANG[t](), t)));
        } else if (t === 'thieu') {
            const bangDs = (ds2, cotThem) => ds2.length ? `<div class="cuon-ngang"><table class="bang bang-the"><tbody>${ds2.map(r => { const h = r._hs || r; return `<tr class="bam" data-id="${h.id}"><td><b>${esc(h.ho_ten)}</b></td><td data-nhan="Đơn vị">${esc(h.don_vi || '')}</td><td>${esc(cotThem(r))}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="trong">Không có.</p>';
            vung.innerHTML = `
            <section class="tam"><h2>Chưa tính được tuổi nghỉ hưu <small>${thieuNS.length} người thiếu ngày sinh hoặc giới tính</small></h2>${bangDs(thieuNS, r => [!r.ngay_sinh && 'Thiếu ngày sinh', !r.gioi_tinh && 'Thiếu giới tính'].filter(Boolean).join(', '))}</section>
            <section class="tam"><h2>Kỷ luật chưa có ngày hết thời hạn <small>${klThieuHan.length} trường hợp</small></h2>${bangDs(klThieuHan, k => [k.hinh_thuc || 'Chưa ghi hình thức', ngayVN(k.ngay_quyet_dinh)].filter(Boolean).join(', '))}</section>
            <section class="tam"><h2>Hồ sơ chưa có dữ liệu nâng lương <small>${khongNL.length} người — kiểm tra tab Ghép tên nâng lương</small></h2>${bangDs(khongNL, r => r.chuc_vu || '')}</section>`;
            $$('tr[data-id]', vung).forEach(tr => tr.addEventListener('click', () => { location.hash = `#/ho-so/${tr.dataset.id}`; }));
        } else if (t === 'ghep') {
            veGhepTen(vung, { ds, nl, ghep, nlChuaGhep, napLai: () => trangCanhBao(trang) });
        } else {
            vung.innerHTML = `
            <section class="tam"><h2>Đồng bộ dữ liệu nâng lương</h2>
                <p>Hệ thống tự lấy dữ liệu từ app theo dõi nâng lương lúc 2 giờ sáng mỗi ngày. Khi vừa sửa bên app nâng lương và cần cập nhật ngay, bấm nút dưới, chọn <b>Run workflow</b>, đợi khoảng 1 phút rồi tải lại trang này.</p>
                ${CFG.GITHUB_REPO ? `<p><a class="nut" href="https://github.com/${esc(CFG.GITHUB_REPO)}/actions/workflows/dong_bo_nang_luong.yml" target="_blank" rel="noopener">Mở trang chạy đồng bộ trên GitHub</a></p>` : ''}
            </section>
            <section class="tam"><h2>20 lần đồng bộ gần nhất</h2>
                ${dongBo.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Thời gian</th><th>Kết quả</th><th class="so">Số dòng</th><th class="so">Đã ghép</th><th>Ghi chú</th></tr></thead><tbody>
                ${dongBo.map(d => `<tr><td data-nhan="Thời gian" style="white-space:nowrap">${esc(new Date(d.luc).toLocaleString('vi-VN'))}</td>
                    <td data-nhan="Kết quả">${d.thanh_cong ? '<span class="the-nho xanh">Thành công</span>' : '<span class="the-nho do">Lỗi</span>'}</td>
                    <td class="so" data-nhan="Số dòng">${d.so_dong ?? ''}</td><td class="so" data-nhan="Đã ghép">${d.da_ghep ?? ''}</td><td>${esc(d.ghi_chu || '')}</td></tr>`).join('')}
                </tbody></table></div>` : '<p class="trong">Chưa có lần đồng bộ nào. Làm theo hướng dẫn trong file HUONG_DAN.md để bật đồng bộ.</p>'}
            </section>`;
        }
    };
    $$('[data-cbtab]', trang).forEach(b => b.addEventListener('click', () => { S.cb.tab = b.dataset.cbtab; ve(); }));
    ve();
}

function veGhepTen(vung, { ds, nl, ghep, nlChuaGhep, napLai }) {
    const boQua = ghep.filter(g => g.bo_qua);
    const daGhep = nl.filter(r => r.ho_so_id);
    const hsDaDung = new Set(daGhep.map(r => r.ho_so_id));
    const theoId = Object.fromEntries(ds.map(r => [r.id, r]));
    const sapXep = [...ds].sort((a, b) => a.ho_ten.localeCompare(b.ho_ten, 'vi'));
    const luaChon = r => {
        const ten = boDau(r.ho_ten).split(' ').pop();
        const goiY = sapXep.filter(h => boDau(h.ho_ten).split(' ').pop() === ten && !hsDaDung.has(h.id));
        const khac = sapXep.filter(h => !goiY.includes(h));
        return `<option value="">— Chọn hồ sơ —</option>${goiY.length ? `<optgroup label="Gợi ý (cùng tên)">${goiY.map(h => `<option value="${h.id}">${esc(h.ho_ten)} — ${esc(h.chuc_vu || '')}</option>`).join('')}</optgroup>` : ''}
            <optgroup label="Tất cả hồ sơ">${khac.map(h => `<option value="${h.id}">${esc(h.ho_ten)}${hsDaDung.has(h.id) ? ' (đã ghép)' : ''}</option>`).join('')}</optgroup>`;
    };
    vung.innerHTML = `
    <section class="tam"><h2>Chưa ghép được <small>${nlChuaGhep.length} người bên app nâng lương chưa tìm thấy hồ sơ cùng tên</small></h2>
        ${nlChuaGhep.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Tên bên app nâng lương</th><th>Chức vụ</th><th>Ghép với hồ sơ</th><th></th></tr></thead><tbody>
        ${nlChuaGhep.map(r => `<tr><td><b>${esc(r.ho_ten)}</b></td><td data-nhan="Chức vụ">${esc(r.chuc_vu || '')}</td>
            <td><select data-chon="${esc(r.ten_chuan)}" style="min-width:220px;min-height:36px;border:1px solid var(--vien);border-radius:6px;padding:4px 8px">${luaChon(r)}</select></td>
            <td class="thao-tac"><div class="nhom-nut"><button class="nut nut-chinh nut-nho" data-ghep="${esc(r.ten_chuan)}">Ghép</button><button class="nut nut-nho" data-boqua="${esc(r.ten_chuan)}">Không có hồ sơ</button></div></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="trong">Tất cả đã được ghép.</p>'}
    </section>
    <section class="tam"><h2>Đã đánh dấu không có hồ sơ <small>${boQua.length} người, ví dụ lao động hợp đồng</small></h2>
        ${boQua.length ? `<div class="cuon-ngang"><table class="bang"><tbody>${boQua.map(g => { const r = nl.find(x => x.ten_chuan === g.ten_chuan); return `<tr><td>${esc(r?.ho_ten || g.ten_chuan)}</td><td class="thao-tac"><button class="nut nut-nhe nut-nho" data-bobo="${esc(g.ten_chuan)}">Bỏ đánh dấu</button></td></tr>`; }).join('')}</tbody></table></div>` : '<p class="trong">Không có.</p>'}
    </section>
    <details class="tam"><summary style="cursor:pointer;font-weight:600">Đã ghép ${daGhep.length} người</summary>
        <div class="cuon-ngang" style="margin-top:12px"><table class="bang"><tbody>${daGhep.map(r => `<tr><td>${esc(r.ho_ten)}</td><td>${esc(theoId[r.ho_so_id]?.ho_ten || '')} <small style="color:var(--mo)">${esc(theoId[r.ho_so_id]?.ma_cbcc || '')}</small></td>
            <td class="thao-tac"><button class="nut nut-nhe nut-nho" data-boghep="${esc(r.ten_chuan)}">Bỏ ghép</button></td></tr>`).join('')}</tbody></table></div>
    </details>`;

    const lam = async (nut, viec, tb) => { nut.disabled = true; try { await viec(); thongBao(tb); await napLai(); } catch (e) { nut.disabled = false; thongBao(dichLoi(e), true); } };
    $$('[data-ghep]', vung).forEach(n => n.addEventListener('click', () => {
        const tc = n.dataset.ghep, hid = $(`[data-chon="${CSS.escape(tc)}"]`, vung).value;
        if (!hid) return thongBao('Chọn hồ sơ cần ghép trước đã.', true);
        lam(n, async () => {
            await q(sb.from('hs_ghep_luong').upsert({ ten_chuan: tc, ho_so_id: hid, bo_qua: false, cap_nhat: new Date().toISOString() }));
            await q(sb.from('hs_nang_luong').update({ ho_so_id: hid }).eq('ten_chuan', tc));
        }, 'Đã ghép.');
    }));
    $$('[data-boqua]', vung).forEach(n => n.addEventListener('click', () => lam(n, async () => {
        await q(sb.from('hs_ghep_luong').upsert({ ten_chuan: n.dataset.boqua, ho_so_id: null, bo_qua: true, cap_nhat: new Date().toISOString() }));
    }, 'Đã đánh dấu không có hồ sơ.')));
    $$('[data-bobo]', vung).forEach(n => n.addEventListener('click', () => lam(n, async () => {
        await q(sb.from('hs_ghep_luong').delete().eq('ten_chuan', n.dataset.bobo));
    }, 'Đã bỏ đánh dấu.')));
    $$('[data-boghep]', vung).forEach(n => n.addEventListener('click', () => lam(n, async () => {
        await q(sb.from('hs_ghep_luong').delete().eq('ten_chuan', n.dataset.boghep));
        await q(sb.from('hs_nang_luong').update({ ho_so_id: null }).eq('ten_chuan', n.dataset.boghep));
    }, 'Đã bỏ ghép. Lần đồng bộ tới sẽ tự ghép lại nếu có hồ sơ trùng tên.')));
}

async function xuatDanhSach(kieu, b, loai) {
    if (!window.XuatFile) return thongBao('Chưa tải được module xuất file. Tải lại trang rồi thử lại.', true);
    let luu = {};
    try { luu = JSON.parse(localStorage.getItem('hs_xuat_ky') || '{}'); } catch (_) { /* bỏ qua */ }
    const tenFile = { nl: 'DanhSach_NangLuong', nh: 'DanhSach_NghiHuu', kl: 'DanhSach_KyLuat' }[loai] + '_' + homNayISO().replace(/-/g, '');
    await hopThoai({
        tieuDe: `Xuất ${kieu === 'word' ? 'Word' : 'Excel'}: ${b.dong.length} trường hợp`, nutChinh: kieu === 'word' ? 'Tải file Word' : 'Tải file Excel',
        noiDung: `<div class="luoi-o" style="grid-template-columns:1fr">
            <label class="o"><span>Tiêu đề</span><input name="tieu_de" value="${esc(b.tieuDe)}"></label>
            <label class="o"><span>Dòng dưới tiêu đề</span><input name="phu_de" value="${esc(b.phuDe)}"></label>
            <label class="o"><span>Người lập biểu (họ và tên)</span><input name="nguoi_lap" value="${esc(luu.nguoi_lap || S.tk.ho_ten || '')}"></label>
            <label class="o"><span>Chức danh người ký</span><textarea name="chuc_danh" style="min-height:72px" placeholder="Ví dụ:&#10;T/L TRƯỞNG BAN&#10;CHÁNH VĂN PHÒNG">${esc(luu.chuc_danh || '')}</textarea><small>Mỗi dòng một chức danh, in hoa khi xuất</small></label>
            <label class="o"><span>Họ và tên người ký</span><input name="nguoi_ky" value="${esc(luu.nguoi_ky || '')}"></label>
        </div>`,
        xuLy: async fd => {
            const g = k => String(fd.get(k) || '').trim();
            const ky = { nguoi_lap: g('nguoi_lap'), chuc_danh: g('chuc_danh'), nguoi_ky: g('nguoi_ky') };
            try { localStorage.setItem('hs_xuat_ky', JSON.stringify(ky)); } catch (_) { /* bỏ qua */ }
            const o = { tieuDe: g('tieu_de') || b.tieuDe, phuDe: g('phu_de'), cot: b.cot, dong: b.dong.map(d => d.map(v => String(v ?? ''))),
                nguoiLap: ky.nguoi_lap, chucDanhKy: ky.chuc_danh, nguoiKy: ky.nguoi_ky, tenFile };
            await (kieu === 'word' ? XuatFile.word(o) : XuatFile.excel(o));
            thongBao('Đã tạo file. Xem trong mục Tải xuống của trình duyệt.');
        },
    });
}

// ─────────────────────────────────────────────────────────
// 8. TRANG DANH SÁCH (Admin)
// ─────────────────────────────────────────────────────────
async function trangDanhSach(trang) {
    const ds = await napDanhSach(true);
    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Danh sách cán bộ, công chức</h1><p data-dem-ds></p></div>
        <button class="nut nut-chinh" type="button" data-them>Thêm hồ sơ</button></div>
    <div class="bo-loc">
        <label class="o"><span>Tìm theo tên, mã hoặc chức vụ</span><input type="search" data-tu value="${esc(S.locDs.tu)}" placeholder="Gõ có dấu hoặc không dấu đều được"></label>
        <label class="o hep"><span>Đơn vị</span><select data-dv><option value="">Tất cả đơn vị</option>${DS_DON_VI.map(x => `<option${x === S.locDs.dv ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
        <label class="o hep"><span>Mức khai</span><select data-tt>
            <option value="">Tất cả</option><option value="chua"${S.locDs.tt === 'chua' ? ' selected' : ''}>Khai dưới 80%</option><option value="du"${S.locDs.tt === 'du' ? ' selected' : ''}>Đã khai đủ</option></select></label>
    </div>
    <div class="tam" style="padding:0;overflow:hidden"><div class="cuon-ngang" data-bang></div></div>`;

    const ve = () => {
        const tu = boDau(S.locDs.tu.trim());
        const kq = ds.filter(r =>
            (!tu || boDau(`${r.ho_ten} ${r.ma_cbcc} ${r.chuc_vu || ''}`).includes(tu)) &&
            (!S.locDs.dv || r.don_vi === S.locDs.dv) &&
            (!S.locDs.tt || (S.locDs.tt === 'chua' ? r._ht.p < 80 : r._ht.p >= 100)));
        $('[data-dem-ds]', trang).textContent = kq.length === ds.length ? `${ds.length} hồ sơ` : `Đang hiện ${kq.length} trong ${ds.length} hồ sơ`;
        const vung = $('[data-bang]', trang);
        vung.innerHTML = kq.length ? `<table class="bang bang-the"><thead><tr><th>TT</th><th>Họ và tên</th><th>Chức vụ</th><th>Đơn vị</th><th>Ngày sinh</th><th>Đã khai</th></tr></thead><tbody>
            ${kq.map((r, i) => `<tr class="bam" data-id="${r.id}">
                <td class="so" data-nhan="TT">${i + 1}</td>
                <td><div class="ten-ds">${anhNho(r)}<div><b>${esc(r.ho_ten)}</b><small>${esc(r.ma_cbcc)}</small></div></div></td>
                <td data-nhan="Chức vụ">${esc(r.chuc_vu || '')}</td><td data-nhan="Đơn vị">${esc(r.don_vi || '')}</td>
                <td data-nhan="Ngày sinh">${esc(ngayVN(r.ngay_sinh))}</td><td>${vach(r._ht.p)}</td></tr>`).join('')}
            </tbody></table>` : `<p class="trong">Không có hồ sơ nào khớp. ${S.locDs.tu || S.locDs.dv || S.locDs.tt ? 'Thử bỏ bớt điều kiện lọc.' : 'Bấm "Thêm hồ sơ" để bắt đầu.'}</p>`;
        $$('tr[data-id]', vung).forEach(tr => tr.addEventListener('click', () => { location.hash = `#/ho-so/${tr.dataset.id}`; }));
        gangAnhNho(vung, kq);
    };
    $('[data-tu]', trang).addEventListener('input', e => { S.locDs.tu = e.target.value; ve(); });
    $('[data-dv]', trang).addEventListener('change', e => { S.locDs.dv = e.target.value; ve(); });
    $('[data-tt]', trang).addEventListener('change', e => { S.locDs.tt = e.target.value; ve(); });
    $('[data-them]', trang).addEventListener('click', themHoSo);
    ve();
}

async function themHoSo() {
    const id = await hopThoai({
        tieuDe: 'Thêm hồ sơ mới', nutChinh: 'Tạo hồ sơ',
        noiDung: `<div class="luoi-o" style="grid-template-columns:1fr 1fr">
            <label class="o"><span>Mã cán bộ <em>*</em></span><input name="ma" autocapitalize="characters" placeholder="Ví dụ: CV48"></label>
            <label class="o"><span>Họ và tên <em>*</em></span><input name="ho_ten"></label>
            <label class="o"><span>Đơn vị</span><select name="don_vi">${DS_DON_VI.map(x => `<option>${esc(x)}</option>`).join('')}</select></label>
            <label class="o"><span>Chức vụ</span><select name="chuc_vu">${DS_CHUC_VU.map(x => `<option${x === 'Chuyên viên' ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
        </div><p style="margin-top:12px;color:var(--mo);font-size:14px">Nếu cán bộ này đăng ký tài khoản bằng đúng mã trên, hồ sơ sẽ tự gắn khi bạn duyệt.</p>`,
        xuLy: async fd => {
            const ma = String(fd.get('ma')).trim().toUpperCase(), ten = String(fd.get('ho_ten')).trim().replace(/\s+/g, ' ');
            if (!ma || !ten) return 'Nhập đủ mã cán bộ và họ tên.';
            if (!/^[A-Z0-9._-]{2,20}$/.test(ma)) return 'Mã cán bộ chỉ gồm chữ không dấu, số, dấu chấm hoặc gạch.';
            const r = await q(sb.from('hs_ho_so').insert({ ma_cbcc: ma, ho_ten: ten, don_vi: fd.get('don_vi'), chuc_vu: fd.get('chuc_vu'), quoc_tich: 'Việt Nam', dan_toc: 'Kinh' }).select('id').single());
            return { id: r.id };
        },
    });
    if (id) { S.ds = null; thongBao('Đã tạo hồ sơ. Khai tiếp các mục còn lại.'); location.hash = `#/ho-so/${id.id}/sua`; }
}

// ─────────────────────────────────────────────────────────
// 9. TRANG TÀI KHOẢN (Admin)
// ─────────────────────────────────────────────────────────
async function trangTaiKhoan(trang) {
    const ds = await q(sb.from('hs_tai_khoan').select('*').order('created_at'));
    const cho = ds.filter(t => t.trang_thai === 'Chờ duyệt');
    const hd = ds.filter(t => t.trang_thai === 'Hoạt động').sort((a, b) => a.ma_cbcc.localeCompare(b.ma_cbcc, 'vi', { numeric: true }));
    const toi = S.session.user.id;
    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Tài khoản đăng nhập</h1><p>${hd.length} tài khoản đang hoạt động${cho.length ? `, ${cho.length} đang chờ duyệt` : ''}</p></div></div>
    <div class="tam"><h2>Chờ phê duyệt</h2>
        ${cho.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Mã</th><th>Họ và tên</th><th>Chức vụ</th><th>Đơn vị</th><th>Ngày đăng ký</th><th></th></tr></thead><tbody>
        ${cho.map(t => `<tr><td data-nhan="Mã"><b>${esc(t.ma_cbcc)}</b></td><td>${esc(t.ho_ten)}</td><td data-nhan="Chức vụ">${esc(t.chuc_vu || '')}</td>
            <td data-nhan="Đơn vị">${esc(t.don_vi || '')}</td><td data-nhan="Ngày đăng ký">${esc(ngayVN(t.created_at))}</td>
            <td class="thao-tac"><div class="nhom-nut"><button class="nut nut-chinh nut-nho" data-duyet="${t.user_id}">Duyệt</button><button class="nut nut-nguy nut-nho" data-tuchoi="${t.user_id}">Từ chối</button></div></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="trong">Không có yêu cầu nào đang chờ.</p>'}
    </div>
    <div class="tam"><h2>Đang hoạt động</h2>
        <div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Mã</th><th>Họ và tên</th><th>Đơn vị</th><th>Quyền</th><th></th></tr></thead><tbody>
        ${hd.map(t => `<tr><td data-nhan="Mã"><b>${esc(t.ma_cbcc)}</b></td><td>${esc(t.ho_ten)}</td><td data-nhan="Đơn vị">${esc(t.don_vi || '')}</td>
            <td data-nhan="Quyền">${t.vai_tro === 'Admin' ? '<span class="the-nho do">Quản trị viên</span>' : '<span class="the-nho">Cán bộ</span>'}</td>
            <td class="thao-tac"><div class="nhom-nut">
                <button class="nut nut-nho" data-mk="${t.user_id}">Đặt lại mật khẩu</button>
                ${t.user_id === toi ? '' : `<button class="nut nut-nho" data-quyen="${t.user_id}" data-vt="${t.vai_tro === 'Admin' ? 'User' : 'Admin'}">${t.vai_tro === 'Admin' ? 'Bỏ quyền quản trị' : 'Cấp quyền quản trị'}</button>
                <button class="nut nut-nguy nut-nho" data-xoa="${t.user_id}">Xóa tài khoản</button>`}
            </div></td></tr>`).join('')}
        </tbody></table></div>
    </div>`;

    const theoId = Object.fromEntries(ds.map(t => [t.user_id, t]));
    const xong = async (msg) => { thongBao(msg); S.ds = null; await trangTaiKhoan(trang); capNhatSoChoDuyet(); };

    $$('[data-duyet]', trang).forEach(b => b.addEventListener('click', async () => {
        b.disabled = true;
        try { await q(sb.rpc('hs_duyet_tai_khoan', { p_user: b.dataset.duyet })); await xong(`Đã duyệt tài khoản ${theoId[b.dataset.duyet].ma_cbcc}.`); }
        catch (e) { b.disabled = false; thongBao(dichLoi(e), true); }
    }));
    $$('[data-tuchoi]', trang).forEach(b => b.addEventListener('click', async () => {
        const t = theoId[b.dataset.tuchoi];
        if (!await xacNhan('Từ chối yêu cầu đăng ký', `Xóa yêu cầu đăng ký của <b>${esc(t.ho_ten)}</b> (${esc(t.ma_cbcc)})? Người này có thể đăng ký lại sau.`, 'Từ chối')) return;
        try { await q(sb.rpc('hs_xoa_tai_khoan', { p_user: t.user_id })); await xong('Đã từ chối yêu cầu.'); } catch (e) { thongBao(dichLoi(e), true); }
    }));
    $$('[data-mk]', trang).forEach(b => b.addEventListener('click', async () => {
        const t = theoId[b.dataset.mk];
        const goiY = Array.from(crypto.getRandomValues(new Uint8Array(8)), x => 'abcdefghjkmnpqrstuvwxyz23456789'[x % 31]).join('');
        const mk = await hopThoai({
            tieuDe: `Đặt lại mật khẩu cho ${t.ho_ten}`, nutChinh: 'Đặt lại mật khẩu',
            noiDung: `<label class="o"><span>Mật khẩu mới</span><input name="mk" value="${goiY}" autocomplete="off"><small>Ít nhất 6 ký tự. Báo mật khẩu này cho cán bộ và nhắc đổi sau khi đăng nhập.</small></label>`,
            xuLy: async fd => {
                const mk = String(fd.get('mk')).trim();
                if (mk.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
                await q(sb.rpc('hs_dat_lai_mat_khau', { p_user: t.user_id, p_mat_khau: mk }));
                return { mk };
            },
        });
        if (mk) await hopThoai({ tieuDe: 'Đã đặt lại mật khẩu', nutPhu: '', nutChinh: 'Xong',
            noiDung: `<p>Mã cán bộ: <b>${esc(t.ma_cbcc)}</b></p><p>Mật khẩu mới: <b style="font-size:20px;letter-spacing:1px">${esc(mk.mk)}</b></p>` });
    }));
    $$('[data-quyen]', trang).forEach(b => b.addEventListener('click', async () => {
        const t = theoId[b.dataset.quyen], lenAdmin = b.dataset.vt === 'Admin';
        if (!await xacNhan(lenAdmin ? 'Cấp quyền quản trị' : 'Bỏ quyền quản trị',
            lenAdmin ? `<b>${esc(t.ho_ten)}</b> sẽ xem, sửa được toàn bộ hồ sơ và duyệt tài khoản.` : `<b>${esc(t.ho_ten)}</b> sẽ chỉ còn xem, sửa hồ sơ của chính mình.`)) return;
        try { await q(sb.rpc('hs_doi_vai_tro', { p_user: t.user_id, p_vai_tro: b.dataset.vt })); await xong('Đã cập nhật quyền.'); } catch (e) { thongBao(dichLoi(e), true); }
    }));
    $$('[data-xoa]', trang).forEach(b => b.addEventListener('click', async () => {
        const t = theoId[b.dataset.xoa];
        if (!await xacNhan('Xóa tài khoản đăng nhập', `Xóa tài khoản của <b>${esc(t.ho_ten)}</b> (${esc(t.ma_cbcc)})? Hồ sơ của người này vẫn được giữ lại, chỉ mất quyền đăng nhập.`, 'Xóa tài khoản')) return;
        try { await q(sb.rpc('hs_xoa_tai_khoan', { p_user: t.user_id })); await xong('Đã xóa tài khoản.'); } catch (e) { thongBao(dichLoi(e), true); }
    }));
}

// ─────────────────────────────────────────────────────────
// 10. TRANG XEM HỒ SƠ
// ─────────────────────────────────────────────────────────
async function trangHoSo(trang, id) {
    const hs = (await q(sb.from('hs_ho_so').select('*').eq('id', id)))[0];
    if (!hs) { trang.innerHTML = '<div class="tam"><p>Không tìm thấy hồ sơ, hoặc tài khoản không có quyền xem hồ sơ này.</p></div>'; return; }
    const coQuyen = S.admin || hs.user_id === S.session.user.id;
    const [con, lay] = await Promise.all([
        Promise.all(Object.entries(BANG_CON).map(async ([b, c]) =>
            [b, await q(sb.from(b).select('*').eq('ho_so_id', id).order(c.thuTu, { ascending: true, nullsFirst: false }).order('id'))])).then(Object.fromEntries),
        layAnh([hs.anh_the]),
    ]);
    const ht = hoanThien(hs, con.hs_cong_tac.length > 0, con.hs_dao_tao.length > 0);
    let nlCuaHs = null;
    try { nlCuaHs = (await sb.from('hs_nang_luong').select('*').eq('ho_so_id', id)).data?.[0] || null; } catch (_) { /* chưa chạy SQL GĐ2 */ }
    const nh = nghiHuu(hs.ngay_sinh, hs.gioi_tinh);
    const hnay = homNayISO();
    const moc = [];
    if (nlCuaHs?.ngay_du_kien) {
        const gan = trongKhoang(nlCuaHs.ngay_du_kien, 'q3');
        moc.push(`<li class="${gan ? 'gan' : ''}"><span>${nlCuaHs.loai === 'vuot_khung' ? 'Nâng phụ cấp vượt khung' : 'Nâng bậc lương'}</span><b>${esc(ngayVN(nlCuaHs.ngay_du_kien))}</b>
            <small>${nlCuaHs.loai === 'vuot_khung' ? `lên ${esc(nlCuaHs.vuot_khung_moi || '')}` : `lên bậc ${esc(nlCuaHs.bac_moi || '')}, hệ số ${esc(soVN(nlCuaHs.he_so_moi))}`}${gan ? ' — sắp đến hạn' : ''}</small></li>`);
    }
    if (nh && nh.ngay >= hnay) {
        const gan = trongKhoang(nh.ngay, 'q12');
        moc.push(`<li class="${gan ? 'gan' : ''}"><span>Nghỉ hưu</span><b>${esc(ngayVN(nh.ngay))}</b><small>khi đủ ${esc(chuTuoi(nh.tuoi))}${gan ? ' — trong 12 tháng tới' : ''}</small></li>`);
    }
    const anhUrl = lay(hs.anh_the);
    const t = tuoi(hs.ngay_sinh);
    const chucDanh = [hs.chuc_vu, hs.don_vi].filter(Boolean).join(', ');
    const tomTat = [
        ['Ngày sinh', hs.ngay_sinh ? `${ngayVN(hs.ngay_sinh)}${t !== null ? ` (${t} tuổi)` : ''}` : null],
        ['Giới tính', hs.gioi_tinh], ['Dân tộc', hs.dan_toc],
        ['Ngạch', (hs.ngach_cong_chuc || nlCuaHs?.ngach_luong) ? `${chuanNgach(hs.ngach_cong_chuc) || chuanNgach(nlCuaHs.ngach_luong)}${(hs.bac_luong || nlCuaHs?.bac_luong) ? `, bậc ${hs.bac_luong || nlCuaHs.bac_luong}` : ''}` : null],
        ['Lý luận chính trị', hs.ly_luan_chinh_tri], ['Vào Đảng', ngayVN(hs.ngay_vao_dang) || null],
    ];

    trang.innerHTML = `
    <section class="bia">
        <div class="gay" aria-hidden="true"></div>
        <div class="khung-anh">
            ${anhUrl ? `<img src="${esc(anhUrl)}" alt="Ảnh thẻ ${esc(hs.ho_ten)}">` : '<div class="chua-anh">Chưa có ảnh 3x4</div>'}
            ${coQuyen ? `<label>${anhUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}<input type="file" accept="image/*" class="an" data-anh-moi></label>` : ''}
        </div>
        <div class="noi-dung">
            <div class="so-hs">Hồ sơ số <b>${esc(hs.ma_cbcc)}</b></div>
            <h1>${esc(hs.ho_ten)}</h1>
            <div class="chuc-danh">${esc(chucDanh || 'Chưa khai chức vụ, đơn vị')}</div>
            <dl>${tomTat.map(([n, v]) => `<div><dt>${esc(n)}</dt><dd>${v ? esc(v) : '<span style="color:#A8A29A;font-weight:400">Chưa khai</span>'}</dd></div>`).join('')}</dl>
            ${moc.length ? `<ul class="moc">${moc.join('')}</ul>` : ''}
            <div class="nhom-nut">
                ${coQuyen ? `<a class="nut nut-chinh" href="#/ho-so/${hs.id}/sua">Sửa hồ sơ</a>` : ''}
                <button class="nut" type="button" data-in>In trang này</button>
                ${S.admin ? `<button class="nut" type="button" data-doi-ma>Đổi mã cán bộ</button><button class="nut nut-nguy" type="button" data-xoa-hs>Xóa hồ sơ</button>` : ''}
            </div>
        </div>
        <div class="thuoc">
            <div class="thuoc-dong"><span>Hồ sơ đã khai <b>${ht.p}%</b></span><span style="color:var(--mo)">${ht.tong - ht.thieu.length}/${ht.tong} mục</span></div>
            <div class="thuoc-vach" role="progressbar" aria-valuenow="${ht.p}" aria-valuemin="0" aria-valuemax="100"><i class="${ht.p >= 100 ? 'du' : ''}" style="--p:0%"></i></div>
            ${ht.thieu.length ? `<details class="thieu"><summary>Còn ${ht.thieu.length} mục chưa khai</summary><ul>${ht.thieu.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : '<div class="thieu" style="color:var(--xanh);font-weight:600">Hồ sơ đã khai đầy đủ.</div>'}
        </div>
    </section>
    ${MUC.map(m => `<section class="tam"><h2>${esc(m.ten)}</h2><dl class="muc-xem">
        ${m.truong.map(f => { const v = hienGiaTri(f, hs[f.k]); return `<div class="${f.rong ? 'rong' : ''}"><dt>${esc(f.n)}</dt><dd class="${v ? '' : 'chua'}">${v ? esc(v) : 'Chưa khai'}</dd></div>`; }).join('')}
    </dl></section>`).join('')}
    <section class="tam">
        <div class="tab" role="tablist">${Object.entries(BANG_CON).map(([b, c], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-con="${b}">${esc(c.ten)} (${con[b].length})</button>`).join('')}
            ${S.admin ? '<button type="button" role="tab" aria-selected="false" data-con="nhat-ky">Lịch sử chỉnh sửa</button>' : ''}</div>
        <div data-vung-con></div>
    </section>`;

    requestAnimationFrame(() => { const i = $('.thuoc-vach i', trang); if (i) i.style.setProperty('--p', ht.p + '%'); });
    $('[data-in]', trang).addEventListener('click', () => window.print());

    // Bảng con
    const vungCon = $('[data-vung-con]', trang);
    const moTab = async (b) => {
        $$('[data-con]', trang).forEach(x => x.setAttribute('aria-selected', x.dataset.con === b));
        if (b === 'nhat-ky') return veNhatKy(vungCon, hs.id);
        veBangCon(vungCon, b, con[b], hs.id, coQuyen, async () => {
            con[b] = await q(sb.from(b).select('*').eq('ho_so_id', id).order(BANG_CON[b].thuTu, { ascending: true, nullsFirst: false }).order('id'));
            $(`[data-con="${b}"]`, trang).textContent = `${BANG_CON[b].ten} (${con[b].length})`;
            S.ds = null;
            moTab(b);
        });
    };
    $$('[data-con]', trang).forEach(x => x.addEventListener('click', () => moTab(x.dataset.con)));
    moTab('hs_cong_tac');

    // Ảnh thẻ
    $('[data-anh-moi]', trang)?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) return thongBao('Ảnh quá lớn (trên 15 MB). Chọn ảnh khác.', true);
        const nhan = e.target.closest('label');
        nhan.firstChild.textContent = 'Đang tải ảnh…';
        try {
            const blob = await lamAnhThe(file);
            const duong = `${hs.id}/anh-${Date.now()}.jpg`;
            const { error } = await sb.storage.from('anh-the').upload(duong, blob, { contentType: 'image/jpeg', upsert: true });
            if (error) throw error;
            await q(sb.from('hs_ho_so').update({ anh_the: duong }).eq('id', hs.id));
            if (hs.anh_the) await sb.storage.from('anh-the').remove([hs.anh_the]);
            S.ds = null;
            thongBao('Đã cập nhật ảnh thẻ.');
            await trangHoSo(trang, id);
        } catch (err) { nhan.firstChild.textContent = 'Thử lại'; thongBao(dichLoi(err), true); }
    });

    // Admin: đổi mã, xóa hồ sơ
    $('[data-doi-ma]', trang)?.addEventListener('click', async () => {
        const ok = await hopThoai({
            tieuDe: 'Đổi mã cán bộ', nutChinh: 'Đổi mã',
            noiDung: `<p>Mã hiện tại: <b>${esc(hs.ma_cbcc)}</b>. Cán bộ dùng mã mới để đăng nhập, mật khẩu giữ nguyên.</p>
                <label class="o"><span>Mã mới</span><input name="ma" autocapitalize="characters" value="${esc(hs.ma_cbcc)}"></label>`,
            xuLy: async fd => {
                const ma = String(fd.get('ma')).trim().toUpperCase();
                if (!/^[A-Z0-9._-]{2,20}$/.test(ma)) return 'Mã cán bộ chỉ gồm chữ không dấu, số, dấu chấm hoặc gạch.';
                if (ma === hs.ma_cbcc) return 'Mã mới đang trùng mã hiện tại.';
                await q(sb.rpc('hs_doi_ma', { p_ho_so: hs.id, p_ma_moi: ma }));
                if (hs.user_id === S.session.user.id) S.tk.ma_cbcc = ma;
            },
        });
        if (ok) { S.ds = null; thongBao('Đã đổi mã cán bộ.'); await trangHoSo(trang, id); }
    });
    $('[data-xoa-hs]', trang)?.addEventListener('click', async () => {
        const ok = await hopThoai({
            tieuDe: 'Xóa hồ sơ', nutChinh: 'Xóa vĩnh viễn',
            noiDung: `<p>Xóa toàn bộ hồ sơ của <b>${esc(hs.ho_ten)}</b>, gồm quá trình công tác, đào tạo, lương, khen thưởng và ảnh thẻ. Không khôi phục được.</p>
                <label class="o"><span>Gõ mã <b>${esc(hs.ma_cbcc)}</b> để xác nhận</span><input name="xn" autocomplete="off"></label>`,
            xuLy: async fd => {
                if (String(fd.get('xn')).trim().toUpperCase() !== hs.ma_cbcc) return 'Mã xác nhận chưa đúng.';
                if (hs.anh_the) await sb.storage.from('anh-the').remove([hs.anh_the]);
                await q(sb.from('hs_ho_so').delete().eq('id', hs.id));
            },
        });
        if (ok) { S.ds = null; if (hs.id === S.hoSoCuaToi) S.hoSoCuaToi = null; thongBao('Đã xóa hồ sơ.'); location.hash = '#/danh-sach'; }
    });
}

// Form khen thưởng/kỷ luật: ẩn hiện ô kỷ luật, lọc hình thức theo hệ thống, gợi ý ngày hết thời hạn
function ganKyLuat(form) {
    const o = k => form.elements[k];
    const khung = k => o(k).closest('.o');
    let suaTay = !!o('ngay_het_han').value;
    o('ngay_het_han').addEventListener('input', () => { suaTay = !!o('ngay_het_han').value; });
    const capNhat = (doiHinhThuc) => {
        const laKL = o('loai').value === 'Kỷ luật';
        ['he_thong', 'hinh_thuc', 'ngay_het_han'].forEach(k => khung(k).classList.toggle('an', !laKL));
        if (!laKL) return;
        const ht = o('he_thong').value || 'Chính quyền';
        if (!o('he_thong').value) o('he_thong').value = ht;
        if (doiHinhThuc) {
            const cu = o('hinh_thuc').value;
            const ds = Object.keys(THOI_HAN_KL[ht]);
            o('hinh_thuc').innerHTML = '<option value="">— Chọn —</option>' + ds.map(x => `<option${x === cu ? ' selected' : ''}>${esc(x)}</option>`).join('');
        }
        const thang = THOI_HAN_KL[ht]?.[o('hinh_thuc').value];
        const goi = khung('ngay_het_han').querySelector('small');
        if (thang && o('ngay_quyet_dinh').value) {
            const goiY = congThang(o('ngay_quyet_dinh').value, thang);
            if (!suaTay) o('ngay_het_han').value = goiY;
            goi.textContent = `Gợi ý: ${thang} tháng kể từ ngày quyết định, tức ${ngayVN(goiY)}. Sửa được nếu quyết định ghi khác.`;
        } else {
            goi.textContent = thang === null ? 'Hình thức này không có thời hạn, để trống.' : 'Nhập ngày quyết định và chọn hình thức để app gợi ý.';
        }
    };
    o('loai').addEventListener('change', () => capNhat(true));
    o('he_thong').addEventListener('change', () => capNhat(true));
    o('hinh_thuc').addEventListener('change', () => { suaTay = false; capNhat(false); });
    o('ngay_quyet_dinh').addEventListener('change', () => { suaTay = false; capNhat(false); });
    capNhat(true);
}

function veBangCon(vung, bang, rows, hoSoId, coQuyen, napLai) {
    const c = BANG_CON[bang];
    vung.innerHTML = `
        ${coQuyen ? `<div class="nhom-nut" style="margin-bottom:12px"><button class="nut nut-nho" type="button" data-them-con>Thêm ${esc(c.don)}</button></div>` : ''}
        ${rows.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr>${c.cot.map(f => `<th>${esc(f.n)}</th>`).join('')}${coQuyen ? '<th></th>' : ''}</tr></thead><tbody>
        ${rows.map(r => `<tr>${c.cot.map(f => `<td data-nhan="${esc(f.n)}"${f.loai === 'so' ? ' class="so"' : ''}>${esc(hienGiaTri(f, r[f.k]) || (f.k === 'den_ngay' && bang === 'hs_cong_tac' ? 'nay' : ''))}</td>`).join('')}
            ${coQuyen ? `<td class="thao-tac"><div class="nhom-nut" style="justify-content:flex-end"><button class="nut nut-nhe nut-nho" data-sua-con="${r.id}">Sửa</button><button class="nut nut-nhe nut-nho" data-xoa-con="${r.id}">Xóa</button></div></td>` : ''}</tr>`).join('')}
        </tbody></table></div>` : `<p class="trong">Chưa có ${esc(c.don)} nào.${coQuyen ? ' Bấm nút Thêm để khai.' : ''}</p>`}`;

    const moForm = async (r) => {
        const ok = await hopThoai({
            tieuDe: `${r ? 'Sửa' : 'Thêm'} ${c.don}`, nutChinh: r ? 'Lưu thay đổi' : 'Thêm',
            noiDung: `<div class="luoi-o" style="grid-template-columns:1fr 1fr">${c.cot.map(f => oNhap(f, r ? r[f.k] : (f.k === 'loai' ? 'Khen thưởng' : ''))).join('')}</div>`,
            sauKhiMo: bang === 'hs_khen_thuong' ? ganKyLuat : null,
            xuLy: async fd => {
                const [du, loi] = docForm(fd, c.cot);
                if (loi) return loi;
                if (bang === 'hs_khen_thuong' && du.loai !== 'Kỷ luật') { du.he_thong = null; du.hinh_thuc = null; du.ngay_het_han = null; }
                if (du.ngay_het_han && du.ngay_quyet_dinh && du.ngay_het_han < du.ngay_quyet_dinh) return 'Ngày hết thời hạn không thể trước ngày quyết định.';
                if (r) await q(sb.from(bang).update(du).eq('id', r.id));
                else await q(sb.from(bang).insert({ ...du, ho_so_id: hoSoId }));
            },
        });
        if (ok) { thongBao(r ? 'Đã lưu thay đổi.' : `Đã thêm ${c.don}.`); await napLai(); }
    };
    $('[data-them-con]', vung)?.addEventListener('click', () => moForm(null));
    $$('[data-sua-con]', vung).forEach(b => b.addEventListener('click', () => moForm(rows.find(r => String(r.id) === b.dataset.suaCon))));
    $$('[data-xoa-con]', vung).forEach(b => b.addEventListener('click', async () => {
        if (!await xacNhan(`Xóa ${c.don}`, `Xóa dòng này khỏi mục ${esc(c.ten.toLowerCase())}?`, 'Xóa')) return;
        try { await q(sb.from(bang).delete().eq('id', b.dataset.xoaCon)); thongBao('Đã xóa.'); await napLai(); } catch (e) { thongBao(dichLoi(e), true); }
    }));
}

async function veNhatKy(vung, hoSoId) {
    vung.innerHTML = '<div class="dang-tai">Đang tải…</div>';
    const [nk, tk] = await Promise.all([
        q(sb.from('hs_nhat_ky').select('*').eq('ho_so_id', hoSoId).order('thoi_gian', { ascending: false }).limit(50)),
        q(sb.from('hs_tai_khoan').select('user_id, ho_ten')),
    ]);
    const ten = Object.fromEntries(tk.map(t => [t.user_id, t.ho_ten]));
    const tenBang = { hs_ho_so: 'Hồ sơ chính', ...Object.fromEntries(Object.entries(BANG_CON).map(([b, c]) => [b, c.ten])) };
    const nhanTruong = (bang, k) => (bang === 'hs_ho_so' ? TRUONG[k]?.n : BANG_CON[bang]?.cot.find(f => f.k === k)?.n) || (k === 'anh_the' ? 'Ảnh thẻ' : k === 'ma_cbcc' ? 'Mã cán bộ' : k === 'user_id' ? 'Tài khoản gắn' : k);
    const ngan = v => { const s = v === null || v === undefined || v === '' ? '(trống)' : String(v); return s.length > 60 ? s.slice(0, 60) + '…' : s; };
    const moTa = r => {
        if (r.thao_tac === 'Sửa') return Object.entries(r.thay_doi || {}).map(([k, v]) => `${nhanTruong(r.bang, k)}: “${ngan(v.cu)}” thành “${ngan(v.moi)}”`).join('; ');
        const d = r.thay_doi || {};
        return r.bang === 'hs_ho_so' ? `${d.ho_ten || ''} (${d.ma_cbcc || ''})` : ngan(d.vi_tri || d.ten_truong || d.noi_dung || d.bac_luong || '');
    };
    vung.innerHTML = nk.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Mục</th><th>Thao tác</th><th>Nội dung</th></tr></thead><tbody>
        ${nk.map(r => `<tr><td data-nhan="Thời gian" style="white-space:nowrap">${esc(new Date(r.thoi_gian).toLocaleString('vi-VN'))}</td>
            <td data-nhan="Người">${esc(r.nguoi_sua ? (ten[r.nguoi_sua] || 'Tài khoản đã xóa') : 'Chuyển dữ liệu')}</td>
            <td data-nhan="Mục">${esc(tenBang[r.bang] || r.bang)}</td><td data-nhan="Thao tác">${esc(r.thao_tac)}</td><td>${esc(moTa(r))}</td></tr>`).join('')}
        </tbody></table></div><p style="color:var(--mo);font-size:13px;margin:10px 0 0">Hiện 50 thay đổi gần nhất.</p>` : '<p class="trong">Chưa có thay đổi nào được ghi lại.</p>';
}

// ─────────────────────────────────────────────────────────
// 11. TRANG SỬA HỒ SƠ
// ─────────────────────────────────────────────────────────
async function trangSua(trang, id) {
    const hs = (await q(sb.from('hs_ho_so').select('*').eq('id', id)))[0];
    if (!hs || !(S.admin || hs.user_id === S.session.user.id)) {
        trang.innerHTML = '<div class="tam"><p>Không tìm thấy hồ sơ, hoặc tài khoản không có quyền sửa hồ sơ này.</p></div>';
        return;
    }
    const veXem = hs.id === S.hoSoCuaToi ? '#/cua-toi' : `#/ho-so/${hs.id}`;
    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Sửa hồ sơ: ${esc(hs.ho_ten)}</h1><p>Mã ${esc(hs.ma_cbcc)}. Mục có dấu <span style="color:var(--do)">*</span> bắt buộc; các mục khác khai đến đâu lưu đến đó.</p></div></div>
    <form id="f-sua" novalidate>
        ${MUC.map(m => `<section class="tam"><h2>${esc(m.ten)}</h2><div class="luoi-o">${m.truong.map(f => oNhap(f, hs[f.k])).join('')}</div></section>`).join('')}
        <div class="thanh-luu"><span data-tt-luu>Chưa có thay đổi</span>
            <div class="nhom-nut"><a class="nut nut-nhe" href="${veXem}">Hủy</a><button class="nut nut-chinh" type="submit">Lưu hồ sơ</button></div></div>
    </form>`;
    const form = $('#f-sua', trang);
    form.addEventListener('input', () => { S.chuaLuu = true; $('[data-tt-luu]', form).textContent = 'Có thay đổi chưa lưu'; });
    $('a.nut-nhe', form).addEventListener('click', () => { S.chuaLuu = false; });
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const nut = $('[type=submit]', form);
        const ds = MUC.flatMap(m => m.truong);
        const [du, loi] = docForm(new FormData(form), ds);
        const baoLoi = msg => { thongBao(msg, true); };
        if (loi) return baoLoi(loi);
        if (du.so_cccd && !/^(\d{9}|\d{12})$/.test(du.so_cccd)) return baoLoi('Số CCCD gồm 12 chữ số (CMND cũ: 9 chữ số).');
        if (du.so_bhxh && !/^\d{10}$/.test(du.so_bhxh)) return baoLoi('Số sổ BHXH gồm 10 chữ số.');
        const homNay = new Date().toISOString().slice(0, 10);
        if (du.ngay_sinh && du.ngay_sinh >= homNay) return baoLoi('Ngày sinh phải trước ngày hôm nay.');
        if (du.ngay_vao_dang && du.ngay_chinh_thuc && du.ngay_chinh_thuc < du.ngay_vao_dang) return baoLoi('Ngày chính thức không thể trước ngày vào Đảng.');
        if (du.ngay_nhap_ngu && du.ngay_xuat_ngu && du.ngay_xuat_ngu < du.ngay_nhap_ngu) return baoLoi('Ngày xuất ngũ không thể trước ngày nhập ngũ.');
        du.ho_ten = du.ho_ten.replace(/\s+/g, ' ');
        nut.disabled = true;
        try {
            await q(sb.from('hs_ho_so').update(du).eq('id', hs.id));
            S.chuaLuu = false; S.ds = null;
            if (hs.user_id === S.session.user.id && S.tk.ho_ten !== du.ho_ten) S.tk.ho_ten = du.ho_ten;
            thongBao('Đã lưu hồ sơ.');
            location.hash = veXem;
        } catch (err) { nut.disabled = false; baoLoi(dichLoi(err)); }
    });
}

// ─────────────────────────────────────────────────────────
// 12. ĐỔI MẬT KHẨU
// ─────────────────────────────────────────────────────────
function trangDoiMatKhau(trang) {
    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Đổi mật khẩu</h1><p>Tài khoản ${esc(S.tk.ma_cbcc)}</p></div></div>
    <section class="tam" style="max-width:520px">
        <form id="f-mk" novalidate style="display:flex;flex-direction:column;gap:14px">
            <label class="o"><span>Mật khẩu hiện tại</span><input name="cu" type="password" autocomplete="current-password"></label>
            <label class="o"><span>Mật khẩu mới</span><input name="moi" type="password" autocomplete="new-password"><small>Ít nhất 6 ký tự</small></label>
            <label class="o"><span>Nhập lại mật khẩu mới</span><input name="moi2" type="password" autocomplete="new-password"></label>
            <div class="loi an" data-loi></div>
            <div><button class="nut nut-chinh" type="submit">Đổi mật khẩu</button></div>
        </form>
    </section>`;
    const form = $('#f-mk', trang), loiEl = $('[data-loi]', form);
    const baoLoi = m => { loiEl.textContent = m; loiEl.classList.toggle('an', !m); };
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const { cu, moi, moi2 } = form;
        if (!cu.value || !moi.value) return baoLoi('Nhập đủ mật khẩu hiện tại và mật khẩu mới.');
        if (moi.value.length < 6) return baoLoi('Mật khẩu mới phải có ít nhất 6 ký tự.');
        if (moi.value !== moi2.value) return baoLoi('Hai lần nhập mật khẩu mới không khớp.');
        if (moi.value === cu.value) return baoLoi('Mật khẩu mới đang trùng mật khẩu hiện tại.');
        const nut = $('[type=submit]', form); nut.disabled = true; baoLoi('');
        try {
            const kt = await sb.auth.signInWithPassword({ email: S.session.user.email, password: cu.value });
            if (kt.error) throw new Error('Mật khẩu hiện tại không đúng.');
            const { error } = await sb.auth.updateUser({ password: moi.value });
            if (error) throw error;
            form.reset(); nut.disabled = false;
            thongBao('Đã đổi mật khẩu.');
        } catch (err) { nut.disabled = false; baoLoi(dichLoi(err)); }
    });
}

// ─────────────────────────────────────────────────────────
// 13. KHỞI ĐỘNG
// ─────────────────────────────────────────────────────────
(async () => {
    ghiTruyCap();
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (session) await napTaiKhoan(session); else manDangNhap();
    } catch (e) {
        manDangNhap(dichLoi(e));
    }
})();
})();
