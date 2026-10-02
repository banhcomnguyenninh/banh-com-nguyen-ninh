-- Chạy bằng SQL Editor Supabase. Tạo bảng riêng, không sửa bảng cũ.
begin;
create table if not exists public.bc_admins(user_id uuid primary key references auth.users(id));
create table if not exists public.bc_products(
 id text primary key default gen_random_uuid()::text,
 name text not null check(length(name) between 1 and 200),
 price integer not null check(price between 0 and 100000000),
 unit text not null default '',description text not null default '',
 ingredients text not null default '',shelf_life text not null default '',
 images text[] not null default '{}',stock integer not null default 0 check(stock between 0 and 1000000),
 active boolean not null default true,hot boolean not null default false
);
create table if not exists public.bc_orders(
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique,
 customer_name text not null, phone text not null, address text not null,
 delivery text not null check(delivery in ('ship','pickup')),note text not null default '',
 total bigint not null check(total>=0),status text not null default 'new' check(status in ('new','confirmed','shipping','done','cancelled')),
 created_at timestamptz not null default now()
);
create table if not exists public.bc_order_items(
 order_id uuid references public.bc_orders(id) on delete restrict,
 product_id text references public.bc_products(id) on delete restrict,
 name text not null,unit text not null,price integer not null,quantity integer not null check(quantity between 1 and 99),
 primary key(order_id,product_id)
);
alter table public.bc_admins enable row level security;
alter table public.bc_products enable row level security;
alter table public.bc_orders enable row level security;
alter table public.bc_order_items enable row level security;
create or replace function public.bc_is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.bc_admins where user_id=auth.uid())$$;
revoke all on function public.bc_is_admin() from public;
grant execute on function public.bc_is_admin() to anon,authenticated;
drop policy if exists bc_products_read on public.bc_products;
create policy bc_products_read on public.bc_products for select to anon,authenticated using(active or public.bc_is_admin());
drop policy if exists bc_products_admin on public.bc_products;
create policy bc_products_admin on public.bc_products for all to authenticated using(public.bc_is_admin()) with check(public.bc_is_admin());
drop policy if exists bc_orders_admin on public.bc_orders;
create policy bc_orders_admin on public.bc_orders for select to authenticated using(public.bc_is_admin());
drop policy if exists bc_items_admin on public.bc_order_items;
create policy bc_items_admin on public.bc_order_items for select to authenticated using(public.bc_is_admin());
revoke all on public.bc_admins,public.bc_orders,public.bc_order_items,public.bc_products from anon,authenticated;
grant select on public.bc_products to anon;
grant select,insert,update,delete on public.bc_products to authenticated;
grant select on public.bc_orders,public.bc_order_items to authenticated;
-- Giá và tồn kho được kiểm tra tại database. Đặt đơn + trừ tồn kho trong cùng giao dịch.
create or replace function public.bc_place_order(p_request uuid,p_name text,p_phone text,p_address text,p_delivery text,p_note text,p_items jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_order uuid;v_total bigint:=0;v_previous public.bc_orders%rowtype;v_product public.bc_products%rowtype;
 v_item jsonb;v_qty integer;v_id text;
begin
 if p_request is null or p_name is null or length(trim(p_name)) not between 1 and 100 or p_phone is null or p_phone !~ '^0[35789][0-9]{8}$' or p_delivery is null or p_delivery not in ('ship','pickup') or p_note is null or length(p_note)>1000 or p_address is null or length(p_address)>300 or (p_delivery='ship' and length(trim(p_address))=0) then raise exception 'BC:Thông tin nhận hàng chưa hợp lệ.';end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' then raise exception 'BC:Giỏ hàng chưa hợp lệ.';end if;
 if jsonb_array_length(p_items) not between 1 and 50 then raise exception 'BC:Giỏ hàng phải có từ 1 đến 50 sản phẩm.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request::text,0));
 select * into v_previous from public.bc_orders where request_id=p_request;
 if found then return jsonb_build_object('order_id',v_previous.id,'total',v_previous.total);end if;
 if (select count(distinct x->>'id') from jsonb_array_elements(p_items) x)<>jsonb_array_length(p_items) then raise exception 'BC:Sản phẩm bị trùng trong giỏ.';end if;
 -- Khóa sản phẩm theo thứ tự để tránh bán vượt tồn và tránh deadlock.
 for v_item in select value from jsonb_array_elements(p_items) order by value->>'id' loop
  v_id:=v_item->>'id';
  if v_id is null or (v_item->>'quantity') is null or (v_item->>'quantity') !~ '^[0-9]{1,2}$' then raise exception 'BC:Số lượng chưa hợp lệ.';end if;
  v_qty:=(v_item->>'quantity')::integer;
  if v_qty not between 1 and 99 then raise exception 'BC:Số lượng phải từ 1 đến 99.';end if;
  select * into v_product from public.bc_products where id=v_id for update;
  if not found or not v_product.active then raise exception 'BC:Sản phẩm không còn bán.';end if;
  if v_product.stock<v_qty then raise exception 'BC:Sản phẩm % chỉ còn %.',v_product.name,v_product.stock;end if;
  v_total:=v_total+v_product.price::bigint*v_qty;
 end loop;
 insert into public.bc_orders(request_id,customer_name,phone,address,delivery,note,total) values(p_request,trim(p_name),p_phone,trim(p_address),p_delivery,p_note,v_total) returning id into v_order;
 for v_item in select value from jsonb_array_elements(p_items) order by value->>'id' loop
  v_qty:=(v_item->>'quantity')::integer;
  select * into v_product from public.bc_products where id=v_item->>'id';
  insert into public.bc_order_items values(v_order,v_product.id,v_product.name,v_product.unit,v_product.price,v_qty);
  update public.bc_products set stock=stock-v_qty where id=v_product.id;
 end loop;
 return jsonb_build_object('order_id',v_order,'total',v_total);
end $$;
revoke all on function public.bc_place_order(uuid,text,text,text,text,text,jsonb) from public;
grant execute on function public.bc_place_order(uuid,text,text,text,text,text,jsonb) to anon,authenticated;
create or replace function public.bc_update_order(p_order uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
declare v_old text;v_item record;
begin
 if not public.bc_is_admin() then raise exception 'Không có quyền quản trị';end if;
 if p_status is null or p_status not in ('new','confirmed','shipping','done','cancelled') then raise exception 'Trạng thái không hợp lệ';end if;
 select status into v_old from public.bc_orders where id=p_order for update;
 if not found then raise exception 'Không có đơn hàng';end if;
 if v_old=p_status then return;end if;
 if v_old in ('cancelled','done') then raise exception 'Đơn đã kết thúc, không thể đổi trạng thái';end if;
 if not ((v_old='new' and p_status in ('confirmed','cancelled')) or (v_old='confirmed' and p_status in ('shipping','done','cancelled')) or (v_old='shipping' and p_status in ('done','cancelled'))) then raise exception 'Chuyển trạng thái chưa hợp lệ';end if;
 if p_status='cancelled' then
  for v_item in select product_id,quantity from public.bc_order_items where order_id=p_order order by product_id loop
   update public.bc_products set stock=stock+v_item.quantity where id=v_item.product_id;
  end loop;
 end if;
 update public.bc_orders set status=p_status where id=p_order;
end $$;
revoke all on function public.bc_update_order(uuid,text) from public;
grant execute on function public.bc_update_order(uuid,text) to authenticated;
-- Nhập bản sao sản phẩm cũ. Đặt tồn kho ban đầu = 0 để chủ shop nhập số thực tế.
insert into public.bc_products(id,name,price,unit,description,images,stock,active,hot)
select id::text,ten,greatest(0,coalesce(gia,0)::integer),coalesce(quy_cach,''),coalesce(mo_ta,''),
case when nullif(anh_url,'') is null then '{}'::text[] else array[anh_url] end,
0,coalesce(dang_ban,false),coalesce(noi_bat,false)
from public.san_pham
on conflict(id) do nothing;
commit;
-- BƯỚC TIẾP: Tạo user admin ở Authentication > Users, rồi chạy:
-- insert into public.bc_admins(user_id) values ('DÁN-UUID-USER-ADMIN');
