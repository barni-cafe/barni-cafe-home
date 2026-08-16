const SUPABASE_URL="https://yxojtouxwoztjwtmzbys.supabase.co";
const SUPABASE_KEY="sb_publishable_G4P7-79B7uwYO-xe5fsBTA_7VK7BxQ-";
const sb=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);

const products=[
 {id:1,category:"المكسرات",name:"مكسرات مشكلة",desc:"مكسرات محمصة ومقرمشة بتشكيلة غنية.",price:1.000,image:"mix-nuts.jpg",details:"خلطة متنوعة من المكسرات والمقرمشات، مناسبة مع القهوة أو للضيافة."},
 {id:2,category:"المكسرات",name:"خلطة كرسي",desc:"مزيج مقرمش ومتنوع بطعم غني.",price:1.000,image:"mix-yellow.jpg",details:"خلطة مقرمشة تجمع بين الحبوب والمكسرات والنكهات الخفيفة."},
 {id:3,category:"المكسرات",name:"مقرونة هندية",desc:"مقرمشة ولذيذة.",price:1.000,image:"mix-spicy.jpg",details:"خلطة هندية مقرمشة بتشكيلة من الحبوب والمكسرات."},
 {id:4,category:"القهوة",name:"قهوة عربية",desc:"قهوة سادة بطابع برني.",price:0.500,image:"home.jpg",details:"قهوة عربية بسيطة وناعمة، رفيقة مثالية لمنتجات برني."}
];

const $=s=>document.querySelector(s);
const money=n=>Number(n).toFixed(3)+" ر.ع";
let cart=JSON.parse(localStorage.getItem("barni_home_cart")||"[]");
let cat="الكل";

function save(){localStorage.setItem("barni_home_cart",JSON.stringify(cart))}
function total(){return cart.reduce((s,x)=>s+x.price*x.quantity,0)}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove("show"),2200)}

function cats(){
 const a=["الكل",...new Set(products.map(x=>x.category))];
 $("#categories").innerHTML=a.map(x=>`<button class="chip ${x===cat?"active":""}" data-cat="${x}">${x}</button>`).join("");
 document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{cat=b.dataset.cat;cats();render()});
}

function render(){
 const q=$("#search").value.trim();
 const a=products.filter(x=>(cat==="الكل"||x.category===cat)&&(!q||`${x.name} ${x.desc}`.includes(q)));
 $("#products").innerHTML=a.map(x=>`
  <article class="product" data-detail="${x.id}">
    <div class="product-image"><img src="${x.image}" alt="${x.name}" loading="lazy"></div>
    <div class="product-body">
      <p class="eyebrow">${x.category}</p>
      <h3>${x.name}</h3>
      <p>${x.desc}</p>
      <div class="product-bottom">
        <span class="price">${money(x.price)}</span>
        <button class="add" data-add="${x.id}">أضف للسلة +</button>
      </div>
    </div>
  </article>`).join("")||`<p class="empty">ما حصلنا منتج بهذا الاسم.</p>`;

 document.querySelectorAll("[data-detail]").forEach(c=>c.onclick=e=>{if(e.target.closest("[data-add]"))return;detail(+c.dataset.detail)});
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=e=>{e.stopPropagation();add(+b.dataset.add)});
}

function detail(id){
 const x=products.find(p=>p.id===id); if(!x)return;
 $("#detailCard").innerHTML=`
  <div class="detail-grid">
    <div class="detail-image"><img src="${x.image}" alt="${x.name}"></div>
    <div class="detail-copy">
      <p class="eyebrow">${x.category}</p>
      <h2>${x.name}</h2>
      <p>${x.details}</p>
      <div class="detail-price">${money(x.price)}</div>
      <button class="btn primary" id="detailAdd">أضف للسلة</button>
    </div>
  </div>`;
 $("#detailAdd").onclick=()=>add(x.id);
 location.hash="#details";
}

function add(id){
 const p=products.find(x=>x.id===id),o=cart.find(x=>x.id===id);if(!p)return;
 if(o)o.quantity++;else cart.push({...p,quantity:1});
 save();cartUI();toast(`تمت إضافة ${p.name} للسلة`);
}

function qty(id,d){
 const x=cart.find(i=>i.id===id);if(!x)return;
 x.quantity+=d;if(x.quantity<1)cart=cart.filter(i=>i.id!==id);
 save();cartUI();
}

function cartUI(){
 $("#cartBadge").textContent=cart.reduce((s,x)=>s+x.quantity,0);
 $("#cartTotal").textContent=money(total());
 $("#checkoutTotal").textContent=money(total());
 $("#cartItems").innerHTML=cart.length?cart.map(x=>`
  <div class="cart-row">
    <div class="cart-row-top"><strong>${x.name}</strong><span>${money(x.price*x.quantity)}</span></div>
    <small>${money(x.price)} للحبة</small>
    <div class="qty"><button data-m="${x.id}">−</button><span>${x.quantity}</span><button data-p="${x.id}">+</button></div>
  </div>`).join(""):`<p class="empty">السلة فاضية.</p>`;
 document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>qty(+b.dataset.m,-1));
 document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>qty(+b.dataset.p,1));
}

function drawer(v){$("#cartDrawer").hidden=!v;$("#cartDrawer").classList.toggle("open",v)}
function modal(id,v){$("#"+id).hidden=!v}
function orderNo(){return"BRN-"+Math.floor(100000+Math.random()*900000)}

async function submit(e){
 e.preventDefault();
 if(!cart.length)return toast("السلة فاضية");
 const name=$("#customerName").value.trim();
 if(!name)return toast("اكتب اسمك");
 const b=$("#submitOrder");b.disabled=true;b.textContent="جاري إرسال الطلب…";
 const number=orderNo();
 const payload={
   order_number:number,
   customer_name:name,
   notes:$("#notes").value.trim()||null,
   items:cart.map(x=>({id:x.id,name:x.name,quantity:x.quantity,price:x.price})),
   total:Number(total().toFixed(3)),
   status:"new"
 };
 try{
   if(sb){
     const {error}=await sb.from("orders").insert(payload);
     if(error)throw error;
   }
   const a=JSON.parse(localStorage.getItem("barni_home_orders")||"[]");
   a.push(payload);localStorage.setItem("barni_home_orders",JSON.stringify(a));
   cart=[];save();cartUI();
   $("#successNumber").textContent=number;
   $("#successMeta").textContent=`${name} · ${money(payload.total)}`;
   modal("checkoutModal",false);modal("successModal",true);
 }catch(err){
   console.error(err);
   toast("تعذر إرسال الطلب. تأكد من إعدادات الطلبات.");
 }finally{
   b.disabled=false;b.textContent="تأكيد وإرسال الطلب";
 }
}

async function track(e){
 e?.preventDefault();
 const n=$("#trackOrder").value.trim().toUpperCase();
 if(!n)return toast("اكتب رقم الطلب");
 let o=null;
 try{
   if(sb){
     const {data}=await sb.from("orders").select("*").eq("order_number",n).maybeSingle();
     o=data||null;
   }
 }catch(_){}
 if(!o){
   const a=JSON.parse(localStorage.getItem("barni_home_orders")||"[]");
   o=a.find(x=>x.order_number===n)||null;
 }
 if(!o){$("#trackResult").innerHTML=`<div class="track-result">ما حصلنا الطلب. تأكد من الرقم.</div>`;return}
 const i=o.status==="completed"||o.status==="delivered"?2:o.status==="preparing"||o.status==="ready"?1:0;
 const labels=["تم استلام الطلب","جاري التحضير","تم تجهيز الطلب"];
 $("#trackResult").innerHTML=`
   <div class="track-status">${labels[i]}</div>
   <p>طلب <strong>${o.order_number}</strong></p>
   <div class="steps">${labels.map((x,j)=>`
     <div class="step ${j<=i?"active":""}">
       <div class="step-dot">${j+1}</div>${x}
     </div>`).join("")}</div>
   <div class="checkout-summary"><span>الإجمالي</span><strong>${money(o.total||0)}</strong></div>`;
}

$("#search").oninput=render;
$("#openCart").onclick=()=>drawer(true);
document.querySelectorAll("[data-close-cart]").forEach(x=>x.onclick=()=>drawer(false));
$("#checkoutBtn").onclick=()=>{if(!cart.length)return toast("السلة فاضية");drawer(false);modal("checkoutModal",true)};
$("#clearCart").onclick=()=>{cart=[];save();cartUI();toast("تم تفريغ السلة")};
document.querySelectorAll("[data-close-checkout]").forEach(x=>x.onclick=()=>modal("checkoutModal",false));
$("#checkoutForm").onsubmit=submit;
$("#trackForm").onsubmit=track;
$("#goTrack").onclick=()=>{modal("successModal",false);location.hash="#track";$("#trackOrder").value=$("#successNumber").textContent;track()};
$("#closeSuccess").onclick=()=>modal("successModal",false);

cats();render();cartUI();

window.addEventListener("load",()=>{
  setTimeout(()=>{
    document.body.classList.add("intro-done");
    setTimeout(()=>$("#splash")?.remove(),900);
  },1500);
});
