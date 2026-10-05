/* =====================================================================
   XUẤT FILE ĐÚNG THỂ THỨC — Word (.docx) và Excel (.xlsx)
   - Word: tự dựng OOXML bằng JSZip, khổ A4 ngang, Times New Roman,
     đường kẻ dưới "ĐẢNG CỘNG SẢN VIỆT NAM" là Line shape (Shapes),
     số trang ở header là đoạn văn bản thường canh giữa (trường PAGE), từ trang 2.
   - Excel: ExcelJS, có tên cơ quan, tiêu đề, ngày lập, khối ký.
   Dùng: XuatFile.word(opts) / XuatFile.excel(opts)
   opts = { tieuDe, phuDe, cot: [{ n, w (cm), canh: 'giua'|'trai'|'phai' }], dong: [[...]],
            nguoiLap, chucDanhKy (nhiều dòng), nguoiKy, tenFile }
   ===================================================================== */
'use strict';
(() => {
const NAP = {};
function napThuVien(url, ten) {
    if (window[ten]) return Promise.resolve(window[ten]);
    if (!NAP[url]) NAP[url] = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = url; s.onload = () => res(window[ten]);
        s.onerror = () => { delete NAP[url]; rej(new Error('Không tải được thư viện xuất file. Kiểm tra mạng rồi thử lại.')); };
        document.head.appendChild(s);
    });
    return NAP[url];
}
const URL_JSZIP = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
const URL_EXCELJS = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';

const xml = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const homNay = () => new Date();
const ngayThangNam = (d = homNay()) => {
    const t = d.getMonth() + 1;
    return `Tuyên Quang, ngày ${String(d.getDate()).padStart(2, '0')} tháng ${t <= 2 ? String(t).padStart(2, '0') : t} năm ${d.getFullYear()}`;
};
function taiVe(blob, ten) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = ten;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// ─────────────────────────────────────────────────────────
// WORD
// ─────────────────────────────────────────────────────────
const CM = 567;                 // 1 cm = 567 twip
const EMU_CM = 360000;          // 1 cm = 360000 EMU
const W_TRANG = 16838, H_TRANG = 11906;                      // A4 ngang
const LE = { tren: 1134, duoi: 1134, trai: 1418, phai: 1134 }; // 2 / 2 / 2,5 / 2 cm
const W_VUNG = W_TRANG - LE.trai - LE.phai;

const run = (t, { b, i, sz = 28 } = {}) =>
    `<w:r><w:rPr>${b ? '<w:b/>' : ''}${i ? '<w:i/>' : ''}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${xml(t)}</w:t></w:r>`;
const para = (noiDung, { canh = 'center', truoc = 0, sau = 0, dong = 240 } = {}) =>
    `<w:p><w:pPr><w:spacing w:before="${truoc}" w:after="${sau}" w:line="${dong}" w:lineRule="auto"/><w:jc w:val="${canh === 'trai' ? 'left' : canh === 'phai' ? 'right' : canh === 'deu' ? 'both' : 'center'}"/></w:pPr>${noiDung}</w:p>`;

// Đường kẻ bằng Line shape (wps), nằm cùng dòng, canh giữa theo đoạn
let soHinh = 0;
function duongKe(daiCm) {
    soHinh += 1;
    const cx = Math.round(daiCm * EMU_CM);
    return `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="120" w:lineRule="exact"/><w:jc w:val="center"/></w:pPr>
<w:r><w:rPr><w:noProof/><w:sz w:val="4"/></w:rPr><w:drawing>
<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="0"/><wp:effectExtent l="0" t="0" r="0" b="0"/>
<wp:docPr id="${soHinh}" name="Đường kẻ ${soHinh}"/><wp:cNvGraphicFramePr/>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
<wps:wsp><wps:cNvCnPr/><wps:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="0"/></a:xfrm>
<a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:ln w="9525"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:ln></wps:spPr>
<wps:bodyPr/></wps:wsp></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

const oBang = (noiDung, rongTw, { canh = 'center', dam = false, nghieng = false, nen = null, sz = 24 } = {}) =>
    `<w:tc><w:tcPr><w:tcW w:w="${rongTw}" w:type="dxa"/>${nen ? `<w:shd w:val="clear" w:color="auto" w:fill="${nen}"/>` : ''}<w:vAlign w:val="center"/></w:tcPr>
${String(noiDung ?? '').split('\n').map(dongChu => para(run(dongChu, { b: dam, i: nghieng, sz }), { canh, truoc: 40, sau: 40 })).join('')}</w:tc>`;

const bangKhongVien = (cot) => `<w:tbl><w:tblPr><w:tblW w:w="${W_VUNG}" w:type="dxa"/><w:tblLayout w:type="fixed"/>
<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>
<w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr>
<w:tblGrid>${cot.map(c => `<w:gridCol w:w="${c.w}"/>`).join('')}</w:tblGrid><w:tr>${cot.map(c =>
    `<w:tc><w:tcPr><w:tcW w:w="${c.w}" w:type="dxa"/></w:tcPr>${c.noiDung}</w:tc>`).join('')}</w:tr></w:tbl>`;

async function word(o) {
    const JSZip = await napThuVien(URL_JSZIP, 'JSZip');
    soHinh = 0;
    const wTrai = Math.round(W_VUNG * 0.4), wPhai = W_VUNG - wTrai;

    // Phần đầu: cơ quan | quốc hiệu Đảng
    const dau = bangKhongVien([
        { w: wTrai, noiDung: para(run('TỈNH ỦY TUYÊN QUANG', { sz: 28 })) + para(run('BAN TUYÊN GIÁO', { b: true, sz: 28 })) + para(run('*', { sz: 28 })) },
        { w: wPhai, noiDung: para(run('ĐẢNG CỘNG SẢN VIỆT NAM', { b: true, sz: 30 })) + duongKe(6.9) + para(run(ngayThangNam(), { i: true, sz: 28 }), { truoc: 120 }) },
    ]);

    const tieuDe = para(run(o.tieuDe.toUpperCase(), { b: true, sz: 28 }), { truoc: 360 })
        + (o.phuDe ? para(run(o.phuDe, { i: true, sz: 28 }), { sau: 240 }) : para('', { sau: 120 }));

    // Bảng dữ liệu
    const tongCm = o.cot.reduce((s, c) => s + c.w, 0);
    const rong = o.cot.map(c => Math.round(c.w / tongCm * W_VUNG));
    const canhCot = c => c.canh === 'trai' ? 'trai' : c.canh === 'phai' ? 'phai' : 'center';
    const vien = '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(k => `<w:${k} w:val="single" w:sz="4" w:space="0" w:color="000000"/>`).join('') + '</w:tblBorders>';
    const bang = `<w:tbl><w:tblPr><w:tblW w:w="${W_VUNG}" w:type="dxa"/><w:tblLayout w:type="fixed"/>${vien}
<w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>
<w:tblGrid>${rong.map(w => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>
<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${o.cot.map((c, i) => oBang(c.n, rong[i], { dam: true, nen: 'F2F2F2' })).join('')}</w:tr>
${o.dong.length ? o.dong.map(d => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${d.map((v, i) => oBang(v, rong[i], { canh: canhCot(o.cot[i]) })).join('')}</w:tr>`).join('')
        : `<w:tr>${oBang('Không có trường hợp nào.', W_VUNG, {})}</w:tr>`.replace('<w:tcPr>', `<w:tcPr><w:gridSpan w:val="${o.cot.length}"/>`)}
</w:tbl>`;

    // Khối ký
    // Hai cột ký có cùng số dòng để họ tên hai bên thẳng hàng
    const chucDanh = String(o.chucDanhKy || '').split('\n').map(t => t.trim()).filter(Boolean);
    const soDong = Math.max(1, chucDanh.length);
    const cotKy = (dongChucDanh, ten) => para(run('', {}), { truoc: 240 })
        + Array.from({ length: soDong }, (_, i) => para(run((dongChucDanh[i] || '').toUpperCase(), { b: true, sz: 28 }))).join('')
        + [1, 2, 3, 4].map(() => para('')).join('')
        + para(run(ten || '', { b: true, sz: 28 }));
    const ky = bangKhongVien([
        { w: Math.round(W_VUNG / 2), noiDung: cotKy(['Người lập biểu'], o.nguoiLap) },
        { w: W_VUNG - Math.round(W_VUNG / 2), noiDung: cotKy(chucDanh, o.nguoiKy) },
    ]);

    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14"';
    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${NS}><w:body>${dau}${tieuDe}${bang}${ky}
<w:sectPr><w:headerReference w:type="default" r:id="rIdH1"/><w:headerReference w:type="first" r:id="rIdH2"/>
<w:pgSz w:w="${W_TRANG}" w:h="${H_TRANG}" w:orient="landscape"/>
<w:pgMar w:top="${LE.tren}" w:right="${LE.phai}" w:bottom="${LE.duoi}" w:left="${LE.trai}" w:header="567" w:footer="567" w:gutter="0"/>
<w:titlePg/></w:sectPr></w:body></w:document>`;

    // Header: số trang là đoạn văn thường canh giữa, trường PAGE (không dùng khung/textbox)
    const header1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr ${NS}><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0"/></w:pPr>
<w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
<w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:t>2</w:t></w:r><w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:hdr>`;
    const header2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${NS}><w:p/></w:hdr>`;

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>
<w:sz w:val="28"/><w:szCs w:val="28"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblCellMar><w:left w:w="108" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`;
    const zip = new JSZip();
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
<Override PartName="/word/header2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
</Types>`);
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rIdH1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
<Relationship Id="rIdH2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header2.xml"/></Relationships>`);
    zip.file('word/document.xml', docXml);
    zip.file('word/styles.xml', styles);
    zip.file('word/header1.xml', header1);
    zip.file('word/header2.xml', header2);
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    taiVe(blob, o.tenFile + '.docx');
}

// ─────────────────────────────────────────────────────────
// EXCEL
// ─────────────────────────────────────────────────────────
async function excel(o) {
    const ExcelJS = await napThuVien(URL_EXCELJS, 'ExcelJS');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Hồ sơ CBCC — Ban Tuyên giáo Tỉnh ủy Tuyên Quang';
    const ws = wb.addWorksheet('Danh sách', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
            margins: { left: 0.6, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
    });
    const n = o.cot.length;
    const F = (opt = {}) => ({ name: 'Times New Roman', size: 13, ...opt });
    ws.columns = o.cot.map(c => ({ width: Math.max(5, Math.round(c.w * 5.2)) }));
    const tron = (hang, tu, den, giaTri, font, canh = 'center') => {
        ws.mergeCells(hang, tu, hang, den);
        const o2 = ws.getCell(hang, tu);
        o2.value = giaTri; o2.font = F(font); o2.alignment = { horizontal: canh, vertical: 'middle', wrapText: true };
    };
    const nTrai = Math.max(2, Math.round(n * 0.4)), tuPhai = Math.min(n, nTrai + 1);
    tron(1, 1, nTrai, 'TỈNH ỦY TUYÊN QUANG');
    tron(1, tuPhai, n, 'ĐẢNG CỘNG SẢN VIỆT NAM', { bold: true, size: 14 });
    tron(2, 1, nTrai, 'BAN TUYÊN GIÁO', { bold: true });
    tron(2, tuPhai, n, ngayThangNam(), { italic: true });
    tron(3, 1, nTrai, '*');
    ws.getCell(2, tuPhai).border = { top: { style: 'thin' } };   // gạch dưới quốc hiệu
    tron(5, 1, n, o.tieuDe.toUpperCase(), { bold: true, size: 14 });
    ws.getRow(5).height = 22;
    if (o.phuDe) tron(6, 1, n, o.phuDe, { italic: true });

    const hangDau = 8;
    const dau = ws.getRow(hangDau);
    o.cot.forEach((c, i) => {
        const cell = dau.getCell(i + 1);
        cell.value = c.n; cell.font = F({ bold: true, size: 12 });
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    });
    dau.height = 32;
    const vien = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const dong = o.dong.length ? o.dong : [['Không có trường hợp nào.']];
    dong.forEach((d, r) => {
        const row = ws.getRow(hangDau + 1 + r);
        o.cot.forEach((c, i) => {
            const cell = row.getCell(i + 1);
            cell.value = d[i] ?? '';
            cell.font = F({ size: 12 });
            cell.alignment = { horizontal: c.canh === 'trai' ? 'left' : c.canh === 'phai' ? 'right' : 'center', vertical: 'middle', wrapText: true };
        });
    });
    if (!o.dong.length) ws.mergeCells(hangDau + 1, 1, hangDau + 1, n);
    for (let r = hangDau; r <= hangDau + dong.length; r++) for (let c = 1; c <= n; c++) ws.getCell(r, c).border = vien;
    ws.pageSetup.printTitlesRow = `${hangDau}:${hangDau}`;
    ws.views = [{ state: 'frozen', ySplit: hangDau }];

    // Khối ký
    let h = hangDau + dong.length + 2;
    const nuaTrai = Math.max(1, Math.floor(n / 2)), tuKy = nuaTrai + 1;
    const chucDanh = String(o.chucDanhKy || '').split('\n').filter(Boolean);
    tron(h, 1, nuaTrai, 'NGƯỜI LẬP BIỂU', { bold: true });
    chucDanh.forEach((t, i) => tron(h + i, tuKy, n, t.toUpperCase(), { bold: true }));
    const hTen = h + Math.max(1, chucDanh.length) + 4;
    tron(hTen, 1, nuaTrai, o.nguoiLap || '', { bold: true });
    tron(hTen, tuKy, n, o.nguoiKy || '', { bold: true });

    const buf = await wb.xlsx.writeBuffer();
    taiVe(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), o.tenFile + '.xlsx');
}

window.XuatFile = { word, excel, ngayThangNam };
})();
