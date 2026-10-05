/* =====================================================================
   HỒ SƠ CBCC — BAN TUYÊN GIÁO TỈNH ỦY TUYÊN QUANG  (v8.0 — Giai đoạn 1)
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

function hopThoai({ tieuDe, noiDung = '', nutChinh = 'Lưu', nutPhu = 'Hủy', xuLy }) {
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
    ra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
};

// ─────────────────────────────────────────────────────────
// 4. ĐĂNG NHẬP / ĐĂNG KÝ
// ─────────────────────────────────────────────────────────
function manDangNhap(loi = '', tb = '') {
    S.session = null; S.tk = null; S.ds = null; S.anh = {};
    goc.innerHTML = `
    <div class="dang-nhap">
        <section class="dn-trai">
            <img src="logo.png" alt="Biểu trưng ngành Tuyên giáo">
            <small>Ban Tuyên giáo Tỉnh ủy Tuyên Quang</small>
            <h1>Hồ sơ cán bộ, công chức</h1>
            <p>Cán bộ tự khai và cập nhật hồ sơ của mình theo Mẫu 2C-BNV/2008. Văn phòng Ban theo dõi, tổng hợp toàn bộ hồ sơ của cơ quan.</p>
        </section>
        <section class="dn-phai">
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
        </section>
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
    const trang = $('#trang');
    trang.innerHTML = '<div class="dang-tai">Đang tải…</div>';
    window.scrollTo(0, 0);
    try {
        if (p0 === 'tong-quan' && S.admin) await trangTongQuan(trang);
        else if (p0 === 'danh-sach' && S.admin) await trangDanhSach(trang);
        else if (p0 === 'tai-khoan' && S.admin) await trangTaiKhoan(trang);
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
// 7. TRANG TỔNG QUAN (Admin)
// ─────────────────────────────────────────────────────────
async function trangTongQuan(trang) {
    const [ds, choDuyet] = await Promise.all([
        napDanhSach(true),
        q(sb.from('hs_tai_khoan').select('user_id').eq('trang_thai', 'Chờ duyệt')),
    ]);
    const chuaDu = ds.filter(r => r._ht.p < 80);
    const theoDv = DS_DON_VI.map(dv => {
        const n = ds.filter(r => r.don_vi === dv);
        return { dv, so: n.length, tb: n.length ? Math.round(n.reduce((s, r) => s + r._ht.p, 0) / n.length) : 0 };
    }).filter(x => x.so);
    const khac = ds.filter(r => !DS_DON_VI.includes(r.don_vi));
    if (khac.length) theoDv.push({ dv: 'Chưa xếp đơn vị', so: khac.length, tb: Math.round(khac.reduce((s, r) => s + r._ht.p, 0) / khac.length) });
    const canBoSung = [...ds].sort((a, b) => a._ht.p - b._ht.p).slice(0, 12).filter(r => r._ht.p < 100);

    trang.innerHTML = `
    <div class="dau-trang"><div><h1>Tổng quan hồ sơ</h1><p>Cập nhật lúc ${new Date().toLocaleString('vi-VN')}</p></div></div>
    <div class="chi-so">
        <a href="#/danh-sach"><b>${ds.length}</b><span>hồ sơ cán bộ, công chức</span></a>
        <a href="#/tai-khoan" class="${choDuyet.length ? 'can-xu-ly' : ''}"><b>${choDuyet.length}</b><span>tài khoản đang chờ duyệt</span></a>
        <a href="#/danh-sach" data-loc-chua class="${chuaDu.length ? 'can-xu-ly' : ''}"><b>${chuaDu.length}</b><span>hồ sơ khai dưới 80%</span></a>
    </div>
    <div class="tam"><h2>Hồ sơ cần bổ sung <small>Xếp từ hồ sơ khai ít nhất</small></h2>
        ${canBoSung.length ? `<div class="cuon-ngang"><table class="bang bang-the"><thead><tr><th>Cán bộ</th><th>Đơn vị</th><th>Đã khai</th><th>Còn thiếu</th></tr></thead><tbody>
        ${canBoSung.map(r => `<tr class="bam" data-id="${r.id}">
            <td><div class="ten-ds">${anhNho(r)}<div><b>${esc(r.ho_ten)}</b><small>${esc(r.chuc_vu || '')}</small></div></div></td>
            <td data-nhan="Đơn vị">${esc(r.don_vi || '')}</td><td>${vach(r._ht.p)}</td>
            <td data-nhan="Còn thiếu">${esc(r._ht.thieu.slice(0, 3).join(', '))}${r._ht.thieu.length > 3 ? ` và ${r._ht.thieu.length - 3} mục khác` : ''}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="trong">Tất cả hồ sơ đã khai đầy đủ.</p>'}
    </div>
    <div class="tam"><h2>Theo đơn vị</h2>
        <div class="cuon-ngang"><table class="bang"><thead><tr><th>Đơn vị</th><th class="so">Số người</th><th>Mức khai trung bình</th></tr></thead><tbody>
        ${theoDv.map(x => `<tr><td>${esc(x.dv)}</td><td class="so">${x.so}</td><td>${vach(x.tb)}</td></tr>`).join('') || '<tr><td colspan="3" class="trong">Chưa có hồ sơ.</td></tr>'}
        </tbody></table></div>
    </div>`;
    $$('tr[data-id]', trang).forEach(tr => tr.addEventListener('click', () => { location.hash = `#/ho-so/${tr.dataset.id}`; }));
    $('[data-loc-chua]', trang).addEventListener('click', () => { S.locDs.tt = 'chua'; });
    gangAnhNho(trang, canBoSung);
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
    const anhUrl = lay(hs.anh_the);
    const t = tuoi(hs.ngay_sinh);
    const chucDanh = [hs.chuc_vu, hs.don_vi].filter(Boolean).join(', ');
    const tomTat = [
        ['Ngày sinh', hs.ngay_sinh ? `${ngayVN(hs.ngay_sinh)}${t !== null ? ` (${t} tuổi)` : ''}` : null],
        ['Giới tính', hs.gioi_tinh], ['Dân tộc', hs.dan_toc],
        ['Ngạch', hs.ngach_cong_chuc ? `${hs.ngach_cong_chuc}${hs.bac_luong ? `, bậc ${hs.bac_luong}` : ''}` : null],
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
            xuLy: async fd => {
                const [du, loi] = docForm(fd, c.cot);
                if (loi) return loi;
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
