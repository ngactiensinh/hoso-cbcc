// Cấu hình kết nối Supabase — dán URL và khóa "anon public" của project hồ sơ.
// Khóa anon được phép công khai: dữ liệu đã được bảo vệ bằng RLS trong file sql/01_tao_bang.sql.
// TUYỆT ĐỐI KHÔNG dán khóa "service_role" vào đây.
window.HS_CONFIG = {
    SUPABASE_URL: "https://qqzsdxhqrdfvxnlurnyb.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxenNkeGhxcmRmdnhubHVybnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MjY0NjAsImV4cCI6MjA5MTIwMjQ2MH0.H62F5zYEZ5l47fS4IdAE2JdRdI7inXQqWG0nvXhn2P8",
    EMAIL_DOMAIN: "btgtq.vn"   // phải trùng với EMAIL_DOMAIN trong tools/chuyen_du_lieu.py
};
