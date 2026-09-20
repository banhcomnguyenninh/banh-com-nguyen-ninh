const SB_URL="https://nfdovcuvgdmdhynhuhxy.supabase.co";
const SB_KEY="sb_publishable_g4fa73qmE0k9nd9TUNTlpg_88X1DgfV";
const db=window.supabase.createClient(SB_URL,SB_KEY);
let allProducts=[],cart=JSON.parse(localStorage.getItem("nn_cart_store")||"[]"),filter="all";
const $=s=>document.querySelector(s);
const money=n=>Number(n||0).toLocaleString("vi-VN")+"₫";
const safe=s=>{const d=document.createElement("div");d.textContent=String(s??"");return d.innerHTML};

function category(p){const t=(p.ten||"").toLowerCase();if(t.includes("mochi"))return"mochi";if(t.includes("xu xê")||t.includes("phu thê"))return"xu-xe";if(t.includes("ô mai")||t.includes("o mai"))return"o-mai";if(t.includes("cốm tươi")||t.includes("cốm khô")||t.includes("com tuoi"))return"com";if(t.includes("bánh cốm")||t.includes("banh com"))return"banh-com";return"other"}

async function loadProducts(){
  const{data,error}=await db.from("san_pham").select("*").eq("dang_ban",true);
  if(error){$("#products").innerHTML=$("#bestProducts").innerHTML="<p>Chưa tải được sản phẩm. Vui lòng thử lại.</p>";return}
  allProducts=(data||[]).sort((a,b)=>(b.noi_bat===true)-(a.noi_bat===true)||(Number(a.thu_tu_hot)||999)-(Number(b.thu_tu_hot)||999));
  renderAll();
}

function card(p,prefix){
  const key=prefix+"-"+p.id;
  return `<article class="product"><div class="product-image"><img src="${safe(p.anh_url||"feature.jpg")}" alt="${safe(p.ten)}" loading="lazy">${p.noi_bat?'<span class="hot">BÁN CHẠY</span>':""}</div><h3>${safe(p.ten)}</h3>${p.quy_cach?`<p class="packing">${safe(p.quy_cach)}</p>`:""}<div class="description-wrap"><p class="desc" id="desc-${key}">${safe(p.mo_ta||"Sản phẩm được làm mới, phù hợp thưởng thức và làm quà.")}</p><button type="button" class="desc-toggle" data-desc="desc-${key}" aria-expanded="false">Xem thêm</button></div><div class="product-foot"><span class="price">${money(p.gia)}</span></div><div class="product-actions"><div class="quantity"><button class="qty-minus" data-target="${key}">−</button><span id="${key}">1</span><button class="qty-plus" data-target="${key}">+</button></div><button class="add" data-id="${p.id}" data-target="${key}">Thêm vào giỏ</button></div></article>`;
}

function renderAll(){
  const q=$("#search").value.trim().toLowerCase();
  const visible=allProducts.filter(p=>(filter==="all"||category(p)===filter)&&(p.ten||"").toLowerCase().includes(q));
  const best=allProducts.filter(p=>p.noi_bat===true).slice(0,4);
  const chosen=best.length?best:allProducts.slice(0,4);
  $("#bestProducts").innerHTML=chosen.length?chosen.map(p=>card(p,"best")).join(""):"<p>Chưa có sản phẩm bán chạy.</p>";
  $("#products").innerHTML=visible.length?visible.map(p=>card(p,"all")).join(""):"<p>Không tìm thấy sản phẩm phù hợp.</p>";
  bindProductButtons();
}

function bindProductButtons(){
  document.querySelectorAll(".qty-minus").forEach(b=>b.onclick=()=>changeCardQty(b.dataset.target,-1));
  document.querySelectorAll(".qty-plus").forEach(b=>b.onclick=()=>changeCardQty(b.dataset.target,1));
  document.querySelectorAll(".add").forEach(b=>b.onclick=()=>addToCart(b.dataset.id,Number(document.getElementById(b.dataset.target).textContent)));
  document.querySelectorAll(".desc-toggle").forEach(b=>b.onclick=()=>{
    const desc=document.getElementById(b.dataset.desc),opened=desc.classList.toggle("open");
    b.textContent=opened?"Thu gọn":"Xem thêm";
    b.setAttribute("aria-expanded",String(opened));
  });
}
function changeCardQty(target,amount){const el=document.getElementById(target);if(el)el.textContent=Math.max(1,Math.min(99,Number(el.textContent)+amount))}
function save(){localStorage.setItem("nn_cart_store",JSON.stringify(cart));renderCart()}
function addToCart(id,quantity=1){const p=allProducts.find(x=>String(x.id)===String(id));if(!p)return;const old=cart.find(x=>String(x.id)===String(id));old?old.quantity+=quantity:cart.push({id:p.id,ten:p.ten,gia:Number(p.gia),quantity});save();openCart()}
function changeCartQty(index,amount){if(!cart[index])return;cart[index].quantity+=amount;if(cart[index].quantity<=0)cart.splice(index,1);save()}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((s,x)=>s+x.quantity,0);
  $("#cartItems").innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><div><b>${safe(x.ten)}</b><p>${money(x.gia)}</p></div><div class="cart-controls"><button data-cart-minus="${i}">−</button><span>${x.quantity}</span><button data-cart-plus="${i}">+</button><button class="remove" data-remove="${i}">Xóa</button></div></div>`).join(""):"<p>Giỏ hàng đang trống.</p>";
  $("#cartTotal").textContent=money(cart.reduce((s,x)=>s+x.gia*x.quantity,0));
  document.querySelectorAll("[data-cart-minus]").forEach(b=>b.onclick=()=>changeCartQty(Number(b.dataset.cartMinus),-1));
  document.querySelectorAll("[data-cart-plus]").forEach(b=>b.onclick=()=>changeCartQty(Number(b.dataset.cartPlus),1));
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{cart.splice(Number(b.dataset.remove),1);save()});
}
function openCart(){$("#drawer").classList.add("show");$("#backdrop").classList.add("show")}
function closeCart(){$("#drawer").classList.remove("show");$("#backdrop").classList.remove("show")}

$("#cartOpen").onclick=openCart;$("#cartClose").onclick=closeCart;$("#backdrop").onclick=closeCart;
$("#search").oninput=renderAll;
document.querySelectorAll("#filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.filter;renderAll()});
$("#checkout").onsubmit=async e=>{
  e.preventDefault();const msg=$("#orderMessage"),btn=$("#orderButton");
  if(!cart.length){msg.className="error";msg.textContent="Bạn chưa chọn sản phẩm.";return}
  const total=cart.reduce((s,x)=>s+x.gia*x.quantity,0),code="NN"+Date.now().toString().slice(-8);
  btn.disabled=true;btn.textContent="Đang gửi đơn…";
  const{error}=await db.from("don_hang").insert({ma_don:code,ten_khach_hang:$("#customerName").value.trim(),so_dien_thoai:$("#customerPhone").value.trim(),dia_chi:$("#customerAddress").value.trim(),ghi_chu:$("#customerNote").value.trim()||null,san_pham:cart.map(x=>({id:x.id,ten:x.ten,gia:x.gia,soLuong:x.quantity})),tong_tien:total,trang_thai:"moi"});
  btn.disabled=false;btn.textContent="Đặt hàng ngay";
  if(error){msg.className="error";msg.textContent="Chưa gửi được đơn. Vui lòng gọi 0985 868 317.";return}
  msg.className="success";msg.innerHTML=`<b>Đặt hàng thành công!</b><br>Mã đơn: <strong>${code}</strong><br>Cửa hàng sẽ gọi xác nhận sớm.`;cart=[];save();e.target.reset();
};
renderCart();loadProducts();
