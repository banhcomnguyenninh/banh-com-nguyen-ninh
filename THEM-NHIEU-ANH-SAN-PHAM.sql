-- Chạy một lần trong Supabase > SQL Editor.
-- Cột này lưu tối đa 8 đường dẫn ảnh quảng cáo cho mỗi sản phẩm.
alter table public.san_pham
add column if not exists anh_phu jsonb not null default '[]'::jsonb;

comment on column public.san_pham.anh_phu is
'Danh sách đường dẫn ảnh quảng cáo bổ sung của sản phẩm';
