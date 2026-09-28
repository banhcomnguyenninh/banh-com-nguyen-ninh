const SB_URL="https://nfdovcuvgdmdhynhuhxy.supabase.co";
const SB_KEY="sb_publishable_g4fa73qmE0k9nd9TUNTlpg_88X1DgfV";
const PHONE="0985868317";
const db=window.supabase.createClient(SB_URL,SB_KEY);
let allProducts=[],filter="all";
const $=s=>document.querySelector(s);
const money=n=>Number(n||0).toLocaleString("vi-VN")+"₫";
const safe=s=>{const d=document.createElement("div");d.textContent=String(s??"");return d.innerHTML};
function category(p){const t=(p.ten||"").toLowerCase();if(t.includes("mochi"))return"mochi";if(t.includes("xu xê")||t.includes("phu thê"))return"xu-xe";if(t.includes("ô mai")||t.includes("o mai"))return"o-mai";if(t.includes("cốm tươi")||t.includes("cốm khô"))return"com";if(t.includes("bánh cốm"))return"banh-com";return"other"}
async function loadProducts(){const{data,error}=await db.from("san_pham").select("*").eq("dang_ban",true);if(error){$("#products").innerHTML=$("#bestProducts").innerHTML="<p>Chưa tải được sản phẩm.</p>";return}allProducts=(data||[]).sort((a,b)=>(b.noi_bat===true)-(a.noi_bat===true)||(Number(a.thu_tu_hot)||999)-(Number(b.thu_tu_hot)||999));renderAll()}
function card(p,prefix){const key=prefix+"-"+p.id;return `<article class="product"><div class="product-image"><img src="${safe(p.anh_url||"feature.jpg")}" alt="${safe(p.ten)}" loading="lazy">${p.noi_bat?'<span class="hot">BÁN CHẠY</span>':""}</div><h3>${safe(p.ten)}</h3>${p.quy_cach?`<p class="packing">${safe(p.quy_cach)}</p>`:""}<div class="description-wrap"><p class="desc" id="desc-${key}">${safe(p.mo_ta||"Sản phẩm làm mới trong ngày, phù hợp thưởng thức và làm quà.")}</p><button class="desc-toggle" data-desc="desc-${key}">Xem thêm</button></div><div class="product-foot"><span class="price">${money(p.gia)}</span></div><div class="product-actions"><button class="call-buy order-buy" type="button" data-product-id="${safe(p.id)}">Mua ngay</button></div></article>`}

let selectedProduct=null;
const orderModal=$("#orderModal");
const orderForm=$("#quickOrderForm");

function openOrder(product){
  selectedProduct=product;
  $("#orderProduct").textContent=`${product.ten} — ${money(product.gia)}`;
  $("#orderStage").style.backgroundImage=`linear-gradient(#0005,#0005),url("${String(product.anh_url||"feature.jpg").replace(/["\\]/g,"")}")`;
  $("#orderStatus").textContent="";
  orderModal.classList.add("show");
  orderModal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
  setTimeout(()=>$("#orderName").focus(),100);
}

function closeOrder(){
  orderModal.classList.remove("show");
  orderModal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}

function makeOrderCode(){return "NN"+Date.now().toString().slice(-8)}

orderForm.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!selectedProduct)return;
  const submit=$("#orderSubmit"),status=$("#orderStatus");
  const name=$("#orderName").value.trim(),phone=$("#orderPhone").value.trim(),details=$("#orderDetails").value.trim();
  if(!/^0\d{9}$/.test(phone)){status.textContent="Vui lòng nhập số điện thoại gồm 10 số.";return}
  submit.disabled=true;submit.textContent="ĐANG MỞ ZALO…";status.textContent="";
  const orderCode=makeOrderCode();
  const payload={ma_don:orderCode,ten_khach_hang:name,so_dien_thoai:phone,dia_chi:details,ghi_chu:`Đặt nhanh từ sản phẩm: ${selectedProduct.ten}`,san_pham:[{id:selectedProduct.id,ten:selectedProduct.ten,gia:Number(selectedProduct.gia||0),soLuong:1,anh_url:selectedProduct.anh_url||""}],tong_tien:Number(selectedProduct.gia||0),trang_thai:"moi"};
  const zaloMessage=`ĐƠN ĐẶT HÀNG ${orderCode}\n\nKhách hàng: ${name}\nSố điện thoại: ${phone}\nSản phẩm: ${selectedProduct.ten}\nGiá: ${money(selectedProduct.gia)}\nSố lượng/địa chỉ/ghi chú: ${details}\n\nVui lòng xác nhận đơn giúp tôi.`;
  try{await navigator.clipboard.writeText(zaloMessage)}catch{}
  const{error}=await db.from("don_hang").insert(payload);
  submit.disabled=false;submit.textContent="GỬI QUA ZALO";
  if(error){status.textContent="Đơn chưa lưu được nhưng nội dung đã sao chép. Đang mở Zalo…"}else{status.innerHTML=`Đã lưu đơn <b>${orderCode}</b> và sao chép nội dung. Đang mở Zalo…`;orderForm.reset()}
  setTimeout(()=>{window.location.href=`https://zalo.me/${PHONE}`},650);
});

$("#orderClose").addEventListener("click",closeOrder);
orderModal.addEventListener("click",event=>{if(event.target===orderModal)closeOrder()});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeOrder()});

const mobileMenu=$("#mobileMenu"),menuBackdrop=$("#menuBackdrop"),menuOpen=$("#menuOpen");
function setMenu(open){mobileMenu.classList.toggle("show",open);menuBackdrop.classList.toggle("show",open);mobileMenu.setAttribute("aria-hidden",String(!open));menuOpen.setAttribute("aria-expanded",String(open));document.body.classList.toggle("menu-open",open)}
menuOpen.addEventListener("click",()=>setMenu(true));
$("#menuClose").addEventListener("click",()=>setMenu(false));
menuBackdrop.addEventListener("click",()=>setMenu(false));
mobileMenu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenu(false)));
document.addEventListener("keydown",event=>{if(event.key==="Escape")setMenu(false)});

const heroSlider=$("#heroSlider"),heroSlides=[...document.querySelectorAll(".hero-slide")],heroDots=[...document.querySelectorAll(".hero-dots button")];
let heroIndex=0,heroTimer,touchStartX=0;
function showHero(index){heroIndex=(index+heroSlides.length)%heroSlides.length;heroSlides.forEach((slide,i)=>slide.classList.toggle("active",i===heroIndex));heroDots.forEach((dot,i)=>dot.classList.toggle("active",i===heroIndex))}
function startHero(){clearInterval(heroTimer);heroTimer=setInterval(()=>showHero(heroIndex+1),4500)}
$(".hero-prev").addEventListener("click",()=>{showHero(heroIndex-1);startHero()});
$(".hero-next").addEventListener("click",()=>{showHero(heroIndex+1);startHero()});
heroDots.forEach((dot,index)=>dot.addEventListener("click",()=>{showHero(index);startHero()}));
heroSlider.addEventListener("touchstart",event=>{touchStartX=event.changedTouches[0].clientX},{passive:true});
heroSlider.addEventListener("touchend",event=>{const distance=event.changedTouches[0].clientX-touchStartX;if(Math.abs(distance)>45){showHero(heroIndex+(distance<0?1:-1));startHero()}},{passive:true});
heroSlider.addEventListener("mouseenter",()=>clearInterval(heroTimer));
heroSlider.addEventListener("mouseleave",startHero);
document.addEventListener("visibilitychange",()=>document.hidden?clearInterval(heroTimer):startHero());
startHero();

function showNotice(message){
  let notice=document.getElementById("zaloNotice");
  if(!notice){notice=document.createElement("div");notice.id="zaloNotice";notice.setAttribute("role","status");document.body.appendChild(notice)}
  notice.textContent=message;
  notice.classList.add("show");
  clearTimeout(showNotice.timer);
  showNotice.timer=setTimeout(()=>notice.classList.remove("show"),3500);
}
function renderAll(){const q=$("#search").value.trim().toLowerCase(),visible=allProducts.filter(p=>(filter==="all"||category(p)===filter)&&(p.ten||"").toLowerCase().includes(q)),hot=allProducts.filter(p=>p.noi_bat===true).slice(0,6),best=hot.length?hot:allProducts.slice(0,6);$("#bestProducts").innerHTML=best.length?best.map(p=>card(p,"best")).join(""):"<p>Chưa có sản phẩm nổi bật.</p>";$("#products").innerHTML=visible.length?visible.map(p=>card(p,"all")).join(""):"<p>Không tìm thấy sản phẩm.</p>";document.querySelectorAll(".desc-toggle").forEach(b=>b.onclick=()=>{const d=document.getElementById(b.dataset.desc),open=d.classList.toggle("open");b.textContent=open?"Thu gọn":"Xem thêm"});document.querySelectorAll(".order-buy").forEach(b=>b.onclick=()=>{const product=allProducts.find(p=>String(p.id)===String(b.dataset.productId));if(product)openOrder(product)})}
$("#search").oninput=renderAll;
document.querySelectorAll("#filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.filter;renderAll()});
loadProducts();
