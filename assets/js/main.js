// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const BASE   = 'https://qooqz.infinityfreeapp.com/api';
const WA_NUM = '971505931141';

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const LS = { USER:'toro_user', TOKEN:'toro_token', CART:'toro_cart', LANG:'toro_lang' };

let lang   = localStorage.getItem(LS.LANG) || 'ar';
let prods  = [];
let favIds = new Set(); // favorites product IDs for current user
let curFlt = 'all';
let curPg  = 'home';
let modalProdId = null;
let modalQty    = 1;
let admCurrentTab = 'products';
let admSearchQ  = '';

// Apply saved lang immediately
applyLang();

// ══════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════
const TR = {
  eye:   {ar:'عطور فاخرة أصيلة',       en:'Authentic Luxury Fragrances'},
  sub:   {ar:'الإمارات العربية المتحدة', en:'United Arab Emirates'},
  tag:   {ar:'الفاخر لا يحتاج مناسبة', en:'Luxury Needs No Occasion'},
  sph:   {ar:'ابحث عن عطر أو ماركة...', en:'Search perfumes or brands...'},
  ct:    {ar:'🛒 السلة',en:'🛒 Cart'},
  cht:   {ar:'💳 إتمام الطلب',en:'💳 Checkout'},
  ot:    {ar:'📦 طلباتي',en:'📦 My Orders'},
  al:    {ar:'العنوان التفصيلي',en:'Delivery Address'},
  nl:    {ar:'ملاحظات',en:'Notes'},
  pl:    {ar:'تأكيد الطلب',en:'Place Order'},
  ac:    {ar:'أضف للسلة',en:'Add to Cart'},
  ec:    {ar:'السلة فارغة',en:'Cart is empty'},
  no:    {ar:'لا توجد طلبات',en:'No orders yet'},
  sb:    {ar:'المجموع',en:'Subtotal'},
  sh:    {ar:'الشحن',en:'Shipping'},
  fr:    {ar:'مجاني',en:'Free'},
  tot:   {ar:'الإجمالي',en:'Total'},
  aed:   {ar:'د.إ',en:'AED'},
  sv:    {ar:'وفّر',en:'Save'},
  ori:   {ar:'الأصل',en:'Origin'},
  stk:   {ar:'متبقي',en:'Left'},
  sw:    {ar:'حفظ المنتج',en:'Save Product'},
  dsh:   {ar:'لوحة التحكم',en:'Dashboard'},
  aok:   {ar:'✓ أضيف للسلة',en:'✓ Added to cart'},
  ook:   {ar:'✓ تم تقديم طلبك!',en:'✓ Order placed!'},
  lr:    {ar:'سجّل دخولك أولاً',en:'Please login first'},
  qty:   {ar:'الكمية',en:'Quantity'},
  chknote:{ar:'يمكنك إتمام الطلب عبر الموقع أو إرساله مباشرة على واتساب',en:'Complete your order online or send via WhatsApp'},
  wabtn: {ar:'واتساب',en:'WhatsApp'},
  status:{
    pending:   {ar:'قيد الانتظار',en:'Pending'},
    confirmed: {ar:'مؤكد',en:'Confirmed'},
    shipped:   {ar:'تم الشحن',en:'Shipped'},
    delivered: {ar:'تم التوصيل',en:'Delivered'},
    cancelled: {ar:'ملغي',en:'Cancelled'}
  }
};
const t  = k => TR[k]?.[lang] || k;
const ts = s => TR.status[s]?.[lang] || s;

// ══════════════════════════════════════════
// LANGUAGE
// ══════════════════════════════════════════
function applyLang() {
  document.body.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('dir', lang==='ar'?'rtl':'ltr');
  document.documentElement.setAttribute('lang', lang);
  const btn = document.getElementById('lbtn');
  if (btn) btn.textContent = lang==='ar'?'EN':'AR';
}

function swLang() {
  lang = lang==='ar' ? 'en' : 'ar';
  localStorage.setItem(LS.LANG, lang);
  applyLang();
  document.querySelectorAll('[data-ar]').forEach(el => el.textContent = el.getAttribute('data-'+lang));
  const ids = {
    't-eye':t('eye'),'t-sub':t('sub'),'t-tag':t('tag'),'t-cart':t('ct'),'t-chk':t('cht'),
    't-ord':t('ot'),'t-addr':t('al'),'t-notes':t('nl'),'t-place':t('pl'),
    't-save':t('sw'),'t-dash':t('dsh'),'t-qty':t('qty'),
    't-chk-note':t('chknote'),'t-wa-send':t('wabtn')
  };
  Object.entries(ids).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.textContent=val;});
  const si = document.getElementById('srchIn');
  if (si) si.placeholder = t('sph');
  renderMarquee();
  renderPage();
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function nav(pg) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.bni').forEach(b => b.classList.remove('on'));
  document.getElementById('pg-'+pg)?.classList.add('on');
  document.getElementById('bn-'+pg)?.classList.add('on');
  curPg = pg;
  renderPage();
  window.scrollTo(0,0);
}
function renderPage() {
  if (curPg==='home')      renderProds();
  if (curPg==='cart')      renderCart();
  if (curPg==='orders')    renderOrders();
  if (curPg==='favorites') renderFavorites();
  if (curPg==='profile')   renderProfile();
  if (curPg==='checkout')  renderChkSumm();
  if (curPg==='admin')     initAdmin();
}

// ══════════════════════════════════════════
// API HELPER — FIXED TOKEN HANDLING
// ══════════════════════════════════════════
async function api(method, url, body=null) {
  const tk = localStorage.getItem(LS.TOKEN) || '';
  // InfinityFree strips custom headers on GET/DELETE — append _token as query param
  if (tk && (method === 'GET' || method === 'DELETE') && !url.match(/[?&]_token=/)) {
    url += (url.includes('?') ? '&' : '?') + '_token=' + encodeURIComponent(tk);
  }
  const headers = { 'Content-Type': 'application/json' };
  if (tk) headers['X-Token'] = tk;
  if (tk) headers['Authorization'] = 'Bearer ' + tk;
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch(e) { return { ok: false, msg: 'Server error: ' + text.slice(0,120) }; }
  } catch(e) {
    return { ok: false, msg: 'Network error' };
  }
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
function toast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.className='toast'; }, 2800);
}

// ══════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════
const DEMO = [
  {id:1,name_ar:'عود الملكي',name_en:'Royal Oud',brand:'Creed',origin:'France',category:'men',price:450,price_before:550,stock:10,image:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80',description_ar:'عطر عود فاخر برائحة خشبية غنية ودافئة',description_en:'Luxurious oud with rich warm woody notes'},
  {id:2,name_ar:'روز دو باريس',name_en:'Rose de Paris',brand:'Chanel',origin:'France',category:'women',price:380,price_before:null,stock:15,image:'https://images.unsplash.com/photo-1588514912908-53a8b1010e6a?w=400&q=80',description_ar:'رائحة وردية ناعمة من باريس',description_en:'Soft floral rose from Paris'},
  {id:3,name_ar:'أوريانتال نايت',name_en:'Oriental Night',brand:'TORO',origin:'UAE',category:'unisex',price:290,price_before:350,stock:8,image:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80',description_ar:'عطر شرقي دافئ بالعنبر والمسك',description_en:'Warm oriental blend with amber and musk'},
  {id:4,name_ar:'مسك الخالص',name_en:'Pure Musk',brand:'Lattafa',origin:'UAE',category:'unisex',price:180,price_before:null,stock:20,image:'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&q=80',description_ar:'مسك نقي لأناقة يومية',description_en:'Pure musk for everyday elegance'},
  {id:5,name_ar:'جاسمين دريم',name_en:'Jasmine Dream',brand:'YSL',origin:'France',category:'women',price:520,price_before:600,stock:5,image:'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&q=80',description_ar:'مزيج الياسمين والفانيليا الفاخر',description_en:'Luxurious jasmine and vanilla blend'},
  {id:6,name_ar:'سيدار وود',name_en:'Cedar Wood',brand:'TORO',origin:'UAE',category:'men',price:320,price_before:380,stock:12,image:'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&q=80',description_ar:'عطر خشب الأرز بلمسة شرقية',description_en:'Cedar fragrance with oriental touch'},
];

async function loadProds() {
  const r = await api('GET', `${BASE}/products.php`);
  prods = (r.ok && Array.isArray(r.data) && r.data.length) ? r.data : DEMO;
  renderProds();
  renderMarquee();
}

// ── Product color palette for marquee cards ──────────────────
const MQ_COLORS = [
  {bg:'#1a1408',glow:'#c9a84c',text:'#e8d5a3'},  // gold
  {bg:'#180c14',glow:'#d4547a',text:'#f0a0b8'},  // rose
  {bg:'#10101e',glow:'#7a6de8',text:'#b0aaf5'},  // violet
  {bg:'#081514',glow:'#3da8a4',text:'#8bd4d1'},  // teal
  {bg:'#1a110a',glow:'#e8943a',text:'#f0c08a'},  // amber
  {bg:'#0c1018',glow:'#5b9bd5',text:'#a0c4ee'},  // blue
];
const MQ_MIN_REAL = 4;  // minimum real products before using DEMO fallback
const MQ_MAX      = 8;  // max cards shown in marquee

function isActiveProduct(p) {
  return p.is_active !== 0 && p.is_active !== '0';
}

function renderMarquee() {
  const track = document.getElementById('mq-track');
  if (!track) return;
  const list = (prods.length ? prods : DEMO).filter(isActiveProduct);
  // Use DEMO if we have too few real products to fill the marquee
  const src = list.length >= MQ_MIN_REAL ? list.slice(0, MQ_MAX) : DEMO;
  const cards = src.map((p, i) => {
    const nm  = lang === 'ar' ? p.name_ar : p.name_en;
    const col = MQ_COLORS[i % MQ_COLORS.length];
    const img = p.image
      ? `<img src="${escHtml(p.image)}" alt="${escHtml(nm)}" loading="lazy" onerror="this.style.display='none'">`
      : '<span style="font-size:36px">🫙</span>';
    return `<div class="mq-card" style="box-shadow:0 4px 24px -6px ${col.glow}55" onclick="showProd(${p.id})">
      <div class="mq-img" style="background:radial-gradient(circle at 50% 60%,${col.glow}28 0%,${col.bg} 70%)">${img}</div>
      <div class="mq-nm">${escHtml(nm)}</div>
      <div class="mq-pr" style="color:${col.glow}">${p.price} <span style="font-size:9px;font-weight:400;color:${col.text}">${t('aed')}</span></div>
    </div>`;
  }).join('');
  // Duplicate for seamless infinite loop
  track.innerHTML = cards + cards;
}

function setFlt(f, btn) {
  curFlt = f;
  document.querySelectorAll('.flt').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderProds();
}
function doSearch() { renderProds(); }

function renderProdCard(p, i=0) {
  const nm   = lang==='ar' ? p.name_ar : p.name_en;
  const disc = p.price_before ? Math.round((1-p.price/p.price_before)*100) : 0;
  const isFav = favIds.has(p.id);
      const favTitle = isFav
        ? (lang==='ar' ? 'إزالة من المفضلة' : 'Remove from favorites')
        : (lang==='ar' ? 'إضافة للمفضلة'    : 'Add to favorites');
  return `
  <div class="pc" style="animation-delay:${i*0.055}s">
    <div class="pim" onclick="showProd(${p.id})">
      ${p.image ? `<img src="${p.image}" alt="${escHtml(nm)}" loading="lazy" onerror="this.style.display='none'">` : '<div class="pfb">🫙</div>'}
      ${disc ? `<div class="dbd">-${disc}%</div>` : ''}
      ${p.stock>0&&p.stock<=3 ? `<div class="sbd">${p.stock} ${t('stk')}</div>` : ''}
      <button class="fav-btn${isFav?' fav-on':''}" onclick="event.stopPropagation();toggleFav(${p.id})" title="${escHtml(favTitle)}">${isFav?'❤️':'🤍'}</button>
      <div class="prb">
        <div class="prb-row">
          ${p.price_before ? `<span class="prb-was">${p.price_before} ${t('aed')}</span>` : ''}
          <span class="prb-now">${p.price} ${t('aed')}</span>
          ${disc ? `<span class="prb-d">-${disc}%</span>` : ''}
        </div>
      </div>
    </div>
    <div class="pinf">
      <div class="pbr">${escHtml(p.brand)}</div>
      <div class="pnm" onclick="showProd(${p.id})">${escHtml(nm)}</div>
      <div class="prc">
        ${p.price_before ? `<span class="pwas">${p.price_before}</span>` : ''}
        <span class="pnow">${p.price}</span>
        <span class="pcur">${t('aed')}</span>
        ${disc ? `<span class="pdsc">-${disc}%</span>` : ''}
      </div>
      <div class="cbts">
        <button class="cadd" onclick="addCart(${p.id},1)"><span>${t('ac')}</span></button>
        <button class="cwa" onclick="waProduct(${p.id})" title="اطلب عبر واتساب">📱</button>
      </div>
    </div>
  </div>`;
}

function renderProds() {
  const grid = document.getElementById('pGrid');
  if (!grid) return;
  const q = (document.getElementById('srchIn')?.value||'').toLowerCase().trim();
  let list = prods.filter(p => {
    if (!isActiveProduct(p)) return false;
    const mc = curFlt==='all' || p.category===curFlt;
    const ms = !q || p.name_ar.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q);
    return mc && ms;
  });
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1"><div class="empty"><div class="ei">🔍</div><p>${lang==='ar'?'لا نتائج':'No results'}</p></div></div>`;
    return;
  }
  grid.innerHTML = list.map((p,i) => renderProdCard(p, i)).join('');
}

function showProd(id) {
  const p = prods.find(x=>x.id==id); if(!p) return;
  const nm   = lang==='ar' ? p.name_ar : p.name_en;
  const desc = lang==='ar' ? (p.description_ar||'') : (p.description_en||'');
  const disc = p.price_before ? Math.round((1-p.price/p.price_before)*100) : 0;
  const save = p.price_before ? (p.price_before-p.price).toFixed(0) : 0;
  document.getElementById('pdBody').innerHTML = `
    <div>
      <div class="pdim">
        ${p.image ? `<img src="${p.image}" onerror="this.style.display='none'">` : '🫙'}
      </div>
      <div class="pdbr">${escHtml(p.brand)}${p.origin?' · '+escHtml(p.origin):''}</div>
      <div class="pdnm">${escHtml(nm)}</div>
      <div class="pdmt">
        ${p.origin ? `🌍 ${t('ori')}: ${escHtml(p.origin)} &nbsp;·&nbsp; ` : ''}
        📦 ${p.stock>0?(lang==='ar'?'متوفر':'In Stock'):(lang==='ar'?'نفد':'Out of Stock')}
      </div>
      <div class="pdds">${escHtml(desc) || (lang==='ar'?'لا يوجد وصف':'No description')}</div>
      <div class="pdpc">
        ${p.price_before ? `<span class="pdwas">${p.price_before} ${t('aed')}</span>` : ''}
        <span class="pdnow">${p.price} ${t('aed')}</span>
        ${disc ? `<span class="pdsv">${t('sv')} ${save} ${t('aed')} (${disc}%)</span>` : ''}
      </div>
    </div>`;
  modalProdId = id;
  modalQty = 1;
  document.getElementById('mQty').textContent = 1;
  document.getElementById('pdAddBtn').textContent = t('ac');
  document.getElementById('pdMod').classList.add('open');
}

function chgMQty(d) {
  modalQty = Math.max(1, modalQty+d);
  document.getElementById('mQty').textContent = modalQty;
}
function addFromModal() { addCart(modalProdId, modalQty); cm('pdMod'); }
function waFromModal()  { waProduct(modalProdId, modalQty); cm('pdMod'); }

// ══════════════════════════════════════════
// WHATSAPP
// ══════════════════════════════════════════
function waProduct(id, qty=1) {
  const p = prods.find(x=>x.id==id); if(!p) return;
  const nm   = lang==='ar' ? p.name_ar : p.name_en;
  const disc = p.price_before ? ` (كان ${p.price_before} ${t('aed')})` : '';
  const msg = lang==='ar'
    ? `✨ *متجر TORO للعطور*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `مرحباً 👋\nأرغب في طلب المنتج التالي:\n\n` +
      `🫙 *${nm}*\n` +
      `🏷️ الماركة: ${p.brand}\n` +
      `🌍 المنشأ: ${p.origin || '—'}\n` +
      `💰 السعر: *${p.price} ${t('aed')}*${disc}\n` +
      `📦 الكمية: ${qty}\n\n` +
      `💵 *الإجمالي: ${(p.price*qty).toFixed(2)} ${t('aed')}*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💳 الدفع عند الاستلام`
    : `✨ *TORO Perfume Store*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Hello 👋\nI'd like to order:\n\n` +
      `🫙 *${nm}*\n` +
      `🏷️ Brand: ${p.brand}\n` +
      `🌍 Origin: ${p.origin || '—'}\n` +
      `💰 Price: *${p.price} ${t('aed')}*\n` +
      `📦 Qty: ${qty}\n\n` +
      `💵 *Total: ${(p.price*qty).toFixed(2)} ${t('aed')}*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💳 Cash on Delivery`;
  window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
}

function sendWhatsApp() {
  const cart = getCart();
  if (!cart.length) { toast(t('ec'),'er'); return; }
  const lines = cart.map(c => {
    const p = prods.find(x=>x.id==c.product_id); if(!p) return null;
    const nm = lang==='ar' ? p.name_ar : p.name_en;
    return `🫙 *${nm}* × ${c.qty} — ${(p.price*c.qty).toFixed(0)} ${t('aed')}`;
  }).filter(Boolean);
  const total = calcTotal(cart);
  const addr  = document.getElementById('chkAddr')?.value?.trim() || '';
  const notes = document.getElementById('chkNotes')?.value?.trim() || '';
  let msg = lang==='ar'
    ? `✨ *متجر TORO للعطور*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `مرحباً 👋 لدي طلب جديد:\n\n` +
      `${lines.join('\n')}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 *الإجمالي: ${total.toFixed(2)} ${t('aed')}*\n` +
      `🚚 الشحن: مجاني\n` +
      `💳 الدفع عند الاستلام`
    : `✨ *TORO Perfume Store*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Hello 👋 New Order:\n\n` +
      `${lines.join('\n')}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total: ${total.toFixed(2)} ${t('aed')}*\n` +
      `🚚 Shipping: Free\n` +
      `💳 Cash on Delivery`;
  if (addr)  msg += `\n📍 ${lang==='ar'?'العنوان':'Address'}: ${addr}`;
  if (notes) msg += `\n📝 ${lang==='ar'?'ملاحظات':'Notes'}: ${notes}`;
  window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ══════════════════════════════════════════
// CART
// ══════════════════════════════════════════
function getCart() { return JSON.parse(localStorage.getItem(LS.CART)||'[]'); }
function setCart(c) { localStorage.setItem(LS.CART, JSON.stringify(c)); }
function calcTotal(cart) {
  return cart.reduce((s,c)=>{const p=prods.find(x=>x.id==c.product_id);return s+(p?p.price*c.qty:0);},0);
}

function addCart(id, qty=1) {
  const cart = getCart();
  const ex = cart.find(c=>c.product_id==id);
  if (ex) ex.qty += qty; else cart.push({product_id:id, qty});
  setCart(cart);
  updBdg();
  toast(t('aok'), 'ok');
}
function updBdg() {
  const n  = getCart().reduce((s,c)=>s+c.qty,0);
  const el = document.getElementById('cBdg');
  if (el) { el.textContent=n; el.style.display=n?'flex':'none'; }
}
function renderCart() {
  const cart = getCart();
  const el = document.getElementById('cartBody'); if(!el) return;
  if (!cart.length) {
    el.innerHTML = `<div class="empty"><div class="ei">🛒</div><p>${t('ec')}</p></div>`;
    return;
  }
  const rows = cart.map(c=>{
    const p=prods.find(x=>x.id==c.product_id); if(!p) return '';
    const nm=lang==='ar'?p.name_ar:p.name_en;
    return `<div class="citem">
      <div class="cimg">${p.image?`<img src="${p.image}" onerror="this.style.display='none'">`:'🫙'}</div>
      <div class="cinf">
        <div class="cnm">${escHtml(nm)}</div>
        <div class="cpr">${p.price} ${t('aed')}</div>
        <div class="qr">
          <button class="qb" onclick="chgQty(${p.id},-1)">−</button>
          <span class="qv">${c.qty}</span>
          <button class="qb" onclick="chgQty(${p.id},1)">+</button>
          <span style="font-size:11px;color:var(--mu);margin-${lang==='ar'?'right':'left'}:auto">= ${(p.price*c.qty).toFixed(0)} ${t('aed')}</span>
        </div>
      </div>
      <button class="rmb" onclick="rmCart(${p.id})">🗑</button>
    </div>`;
  }).join('');
  const sub = calcTotal(cart);
  el.innerHTML = rows + `<div class="csm">
    <div class="sr"><span>${t('sb')}</span><span>${sub.toFixed(2)} ${t('aed')}</span></div>
    <div class="sr"><span>${t('sh')}</span><span style="color:var(--gr)">${t('fr')}</span></div>
    <div class="sr tot"><span>${t('tot')}</span><span>${sub.toFixed(2)} ${t('aed')}</span></div>
    <div class="cart-btns">
      <button class="btn-g" onclick="goChk()">${t('cht').replace('💳 ','')}</button>
      <button class="btn-wa" onclick="sendWhatsApp()">📱</button>
    </div>
  </div>`;
}
function chgQty(id,d) {
  const cart = getCart();
  const item = cart.find(c=>c.product_id==id); if(!item) return;
  item.qty+=d;
  if (item.qty<=0) { const nc = cart.filter(c=>c.product_id!=id); setCart(nc); }
  else setCart(cart);
  updBdg(); renderCart();
}
function rmCart(id) {
  setCart(getCart().filter(c=>c.product_id!=id));
  updBdg(); renderCart();
}
function goChk() {
  if (!localStorage.getItem(LS.TOKEN)) { toast(t('lr'),'er'); nav('profile'); return; }
  renderChkSumm(); nav('checkout');
}
function renderChkSumm() {
  const sub = calcTotal(getCart());
  const el = document.getElementById('chkSumm'); if(!el) return;
  el.innerHTML = `<div class="csm">
    <div class="sr"><span>${t('sb')}</span><span>${sub.toFixed(2)} ${t('aed')}</span></div>
    <div class="sr"><span>${t('sh')}</span><span style="color:var(--gr)">${t('fr')}</span></div>
    <div class="sr tot"><span>${t('tot')}</span><span>${sub.toFixed(2)} ${t('aed')}</span></div>
  </div>`;
}
async function placeOrder() {
  const tk = localStorage.getItem(LS.TOKEN);
  if (!tk) { toast(t('lr'),'er'); return; }
  const cart = getCart();
  if (!cart.length) { toast(t('ec'),'er'); return; }
  const addr = document.getElementById('chkAddr')?.value?.trim();
  if (!addr) { toast(lang==='ar'?'أدخل العنوان':'Enter address','er'); return; }
  const btn = document.getElementById('placeBtn');
  btn.disabled=true;
  document.getElementById('t-place').textContent='⏳';
  const r = await api('POST', `${BASE}/orders.php`, {
    items: cart,
    address: addr,
    notes: document.getElementById('chkNotes')?.value||''
  });
  btn.disabled=false;
  document.getElementById('t-place').textContent = t('pl');
  if (r.ok) {
    setCart([]);
    updBdg();
    toast(t('ook'),'ok');
    document.getElementById('chkAddr').value='';
    document.getElementById('chkNotes').value='';
    nav('orders');
  } else {
    toast(r.msg||'Error','er');
    // If token invalid, redirect to login
    if (r.msg && r.msg.includes('nauthorized')) { toast(t('lr'),'er'); nav('profile'); }
  }
}

// ══════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════
async function renderOrders() {
  const el = document.getElementById('ordBody'); if(!el) return;
  if (!localStorage.getItem(LS.TOKEN)) {
    el.innerHTML = `<div class="empty"><div class="ei">🔐</div><p>${t('lr')}</p></div>`;
    return;
  }
  el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';
  const r = await api('GET', `${BASE}/orders.php`);
  if (!r.ok || !r.data?.length) {
    el.innerHTML = `<div class="empty"><div class="ei">📦</div><p>${t('no')}</p></div>`;
    return;
  }
  const scls = {pending:'sp',confirmed:'sc2',shipped:'ss',delivered:'sd',cancelled:'sx'};
  el.innerHTML = r.data.map(o=>`
    <div class="oc">
      <div class="oh">
        <span class="oid">#${o.id} · ${o.created_at?.slice(0,10)||''}</span>
        <span class="ost ${scls[o.status]||'sp'}">${ts(o.status)}</span>
      </div>
      <div class="oit">${(o.items||[]).map(i=>`${escHtml(lang==='ar'?i.name_ar:i.name_en)} × ${i.qty}`).join(' / ')}</div>
      <div class="otot">${Number(o.total).toFixed(2)} ${t('aed')}</div>
      ${o.address?`<div style="font-size:11px;color:var(--mu);margin-top:5px">📍 ${escHtml(o.address)}</div>`:''}
    </div>`).join('');
}

// ══════════════════════════════════════════
// PROFILE / AUTH
// ══════════════════════════════════════════
function renderProfile() {
  const el = document.getElementById('profBody'); if(!el) return;
  const u = JSON.parse(localStorage.getItem(LS.USER)||'null');
  if (u) {
    const initial = (u.name||'?')[0].toUpperCase();
    el.innerHTML = `<div class="pw"><div class="pi">
      <div class="pav">${escHtml(initial)}</div>
      <div class="pnm2">${escHtml(u.name)}</div>
      <div class="pem">${escHtml(u.email)}</div>
      <div>
        <button class="bol" onclick="nav('orders')">${lang==='ar'?'📦 طلباتي':'📦 My Orders'}</button>
        ${u.role==='admin'?`<a class="bol" href="admin/index.html" style="display:inline-block">${lang==='ar'?'⚙️ لوحة التحكم':'⚙️ Dashboard'}</a>`:''}
        <br><br>
        <button class="bdr" onclick="doLogout()">${lang==='ar'?'تسجيل الخروج':'Logout'}</button>
      </div>
    </div></div>`;
  } else {
    el.innerHTML = `<div class="aw"><div class="ac">
      <div class="alo"><div class="alt">TORO</div></div>
      <div class="atbs">
        <button class="atb2 on" onclick="aTab('login',this)">${lang==='ar'?'تسجيل الدخول':'Login'}</button>
        <button class="atb2" onclick="aTab('reg',this)">${lang==='ar'?'حساب جديد':'Register'}</button>
      </div>
      <div id="aForm"></div>
    </div></div>`;
    showLogin();
  }
}
function aTab(tab,btn) {
  document.querySelectorAll('.atb2').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  tab==='login' ? showLogin() : showReg();
}
function showLogin() {
  document.getElementById('aForm').innerHTML = `
    <div class="fg"><label class="fl">البريد الإلكتروني / Email</label>
      <input class="fi" id="lEm" type="email" placeholder="example@email.com" autocomplete="email" maxlength="150"></div>
    <div class="fg"><label class="fl">كلمة المرور / Password</label>
      <input class="fi" id="lPw" type="password" placeholder="••••••••" autocomplete="current-password"></div>
    <button class="btn-g" style="width:100%" onclick="doLogin()">${lang==='ar'?'دخول':'Login'}</button>`;
}
function showReg() {
  document.getElementById('aForm').innerHTML = `
    <div class="fg"><label class="fl">الاسم / Name</label>
      <input class="fi" id="rNm" placeholder="${lang==='ar'?'اسمك الكامل':'Full Name'}" autocomplete="name" maxlength="100"></div>
    <div class="fg"><label class="fl">البريد الإلكتروني / Email</label>
      <input class="fi" id="rEm" type="email" placeholder="example@email.com" autocomplete="email" maxlength="150"></div>
    <div class="fg"><label class="fl">كلمة المرور / Password (6+)</label>
      <input class="fi" id="rPw" type="password" placeholder="••••••••" autocomplete="new-password"></div>
    <button class="btn-g" style="width:100%" onclick="doReg()">${lang==='ar'?'إنشاء الحساب':'Create Account'}</button>`;
}
async function doLogin() {
  const em = document.getElementById('lEm')?.value?.trim();
  const pw = document.getElementById('lPw')?.value;
  if (!em||!pw) { toast(lang==='ar'?'أدخل البريد وكلمة المرور':'Enter email and password','er'); return; }
  const r = await api('POST', `${BASE}/auth.php?action=login`, {email:em, password:pw});
  if (r.ok && r.data?.token) {
    localStorage.setItem(LS.TOKEN, r.data.token);
    localStorage.setItem(LS.USER, JSON.stringify(r.data.user));
    toast((lang==='ar'?'مرحباً ':'Welcome ')+r.data.user.name,'ok');
    renderProfile();
  } else {
    toast(r.msg || (lang==='ar'?'بيانات خاطئة':'Invalid credentials'),'er');
  }
}
async function doReg() {
  const nm = document.getElementById('rNm')?.value?.trim();
  const em = document.getElementById('rEm')?.value?.trim();
  const pw = document.getElementById('rPw')?.value;
  if (!nm||!em||!pw) { toast(lang==='ar'?'أكمل جميع الحقول':'Fill all fields','er'); return; }
  if (pw.length<6) { toast(lang==='ar'?'كلمة المرور 6 أحرف على الأقل':'Min 6 characters','er'); return; }
  const r = await api('POST', `${BASE}/auth.php?action=register`, {name:nm,email:em,password:pw});
  if (r.ok && r.data?.token) {
    localStorage.setItem(LS.TOKEN, r.data.token);
    localStorage.setItem(LS.USER, JSON.stringify(r.data.user));
    toast(lang==='ar'?'✓ تم إنشاء الحساب':'✓ Account created','ok');
    renderProfile();
  } else {
    toast(r.msg||'Error','er');
  }
}
function doLogout() {
  localStorage.removeItem(LS.TOKEN);
  localStorage.removeItem(LS.USER);
  toast(lang==='ar'?'تم تسجيل الخروج':'Logged out');
  renderProfile();
}

// ══════════════════════════════════════════
// ADMIN PANEL — FULL
// ══════════════════════════════════════════
function isAdmin() {
  const u = JSON.parse(localStorage.getItem(LS.USER)||'null');
  const tk = localStorage.getItem(LS.TOKEN);
  return u && u.role==='admin' && tk;
}

async function initAdmin() {
  const el = document.getElementById('admContent'); if(!el) return;
  
  if (!isAdmin()) {
    el.innerHTML = `<div class="access-denied">
      <div class="ei">⛔</div>
      <h3>${lang==='ar'?'وصول مرفوض':'Access Denied'}</h3>
      <p>${lang==='ar'?'هذه الصفحة للمديرين فقط. سجّل دخولك بحساب الأدمن.':'This page is for admins only. Please login with an admin account.'}</p>
      <br>
      <button class="btn-g" style="margin:0 auto;display:block;width:fit-content;padding:12px 24px" onclick="nav('profile')">${lang==='ar'?'تسجيل الدخول':'Login'}</button>
    </div>`;
    return;
  }

  el.innerHTML = `
    <div class="adm-wrap">
      <div class="adm-stats" id="admStats"><div class="ldw"><div class="ld"></div></div></div>
      <div class="adm-tabs" id="admTabs">
        <button class="adm-tab on" onclick="admTab('products',this)">${lang==='ar'?'📦 المنتجات':'📦 Products'}</button>
        <button class="adm-tab" onclick="admTab('orders',this)">${lang==='ar'?'🧾 الطلبات':'🧾 Orders'}</button>
        <button class="adm-tab" onclick="admTab('users',this)">${lang==='ar'?'👥 العملاء':'👥 Customers'}</button>
      </div>
      <div id="admBody"><div class="ldw"><div class="ld"></div></div></div>
    </div>`;

  loadAdmStats();
  loadAdmProds();
}

async function loadAdmStats() {
  const r = await api('GET', `${BASE}/stats.php`);
  const el = document.getElementById('admStats'); if(!el) return;
  if (!r.ok) {
    el.innerHTML = `<div style="grid-column:1/-1;color:var(--re);padding:10px">${r.msg}</div>`;
    return;
  }
  const s = r.data;
  const rev = Number(s.revenue)||0;
  const maxRev = 10000;
  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-val">${s.total_products}</div>
      <div class="stat-lbl">${lang==='ar'?'منتجات نشطة':'Active Products'}</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-icon">🧾</div>
      <div class="stat-val">${s.total_orders}</div>
      <div class="stat-lbl">${lang==='ar'?'إجمالي الطلبات':'Total Orders'}</div>
      ${s.pending_orders>0?`<div style="font-size:10px;color:var(--or);margin-top:4px">⏳ ${s.pending_orders} ${lang==='ar'?'معلق':'pending'}</div>`:''}
    </div>
    <div class="stat-card green">
      <div class="stat-icon">👥</div>
      <div class="stat-val">${s.total_users}</div>
      <div class="stat-lbl">${lang==='ar'?'عملاء مسجلون':'Registered Customers'}</div>
    </div>
    <div class="stat-card orange">
      <div class="stat-icon">💰</div>
      <div class="stat-val">${rev.toFixed(0)}</div>
      <div class="stat-lbl">${lang==='ar'?'الإيرادات (د.إ)':'Revenue (AED)'}</div>
      <div class="rev-bar"><div class="rev-fill" style="width:${Math.min(100,(rev/maxRev)*100)}%"></div></div>
    </div>`;
}

async function admTab(tab, btn) {
  if (!isAdmin()) return;
  document.querySelectorAll('.adm-tab').forEach(b=>b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  admCurrentTab = tab;
  admSearchQ = '';
  document.getElementById('admBody').innerHTML = '<div class="ldw"><div class="ld"></div></div>';
  if (tab==='products') await loadAdmProds();
  if (tab==='orders')   await loadAdmOrds();
  if (tab==='users')    await loadAdmUsers();
}

async function loadAdmProds() {
  const r = await api('GET', `${BASE}/products.php`);
  const list = (r.ok && Array.isArray(r.data)) ? r.data : prods;
  const el = document.getElementById('admBody'); if(!el) return;

  el.innerHTML = `
    <button class="btn-add" onclick="openPF()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      ${lang==='ar'?'إضافة منتج جديد':'Add New Product'}
    </button>
    <div class="adm-search">
      <span class="sic">🔍</span>
      <input placeholder="${lang==='ar'?'بحث في المنتجات...':'Search products...'}" oninput="admProdSearch(this.value)" value="${admSearchQ}">
    </div>
    <div class="tw" id="prodTableWrap">
      ${renderProdTable(list)}
    </div>`;
}

function admProdSearch(q) {
  admSearchQ = q.toLowerCase();
  const r = prods.filter(p =>
    p.name_ar.toLowerCase().includes(admSearchQ) ||
    p.name_en.toLowerCase().includes(admSearchQ) ||
    (p.brand||'').toLowerCase().includes(admSearchQ)
  );
  const wrap = document.getElementById('prodTableWrap');
  if (wrap) wrap.innerHTML = renderProdTable(r);
}

function renderProdTable(list) {
  if (!list.length) return `<div class="adm-empty"><div class="ei">📦</div><p>${lang==='ar'?'لا توجد منتجات':'No products found'}</p></div>`;
  const scls = {men:'cat-m',women:'cat-w',unisex:'cat-u'};
  const catLbls = {men:{ar:'رجالي',en:'Men'},women:{ar:'نسائي',en:'Women'},unisex:{ar:'للجنسين',en:'Unisex'}};
  return `<table>
    <thead><tr>
      <th>📷</th>
      <th>${lang==='ar'?'المنتج':'Product'}</th>
      <th>${lang==='ar'?'الماركة':'Brand'}</th>
      <th>${lang==='ar'?'الفئة':'Category'}</th>
      <th>${lang==='ar'?'السعر قبل':'Before'}</th>
      <th>${lang==='ar'?'السعر بعد':'After'}</th>
      <th>${lang==='ar'?'الخصم':'Disc'}</th>
      <th>${lang==='ar'?'المخزون':'Stock'}</th>
      <th>${lang==='ar'?'الحالة':'Status'}</th>
      <th>${lang==='ar'?'إجراء':'Action'}</th>
    </tr></thead>
    <tbody>${list.map(p=>{
      const disc = p.price_before?Math.round((1-p.price/p.price_before)*100):0;
      const nm = lang==='ar'?p.name_ar:p.name_en;
      const catCls = scls[p.category]||'cat-u';
      const catLbl = catLbls[p.category]?.[lang]||p.category;
      const active = p.is_active==1||p.is_active===undefined;
      return `<tr>
        <td><div class="prod-thumb">
          ${p.image?`<img src="${p.image}" onerror="this.style.display='none'">` : '🫙'}
        </div></td>
        <td style="color:var(--tx);max-width:140px">
          <div style="font-weight:500">${escHtml(nm)}</div>
          ${p.origin?`<div style="font-size:10px;color:var(--mu);margin-top:2px">🌍 ${escHtml(p.origin)}</div>`:''}
        </td>
        <td style="color:var(--tx);font-weight:500">${escHtml(p.brand)}</td>
        <td><span class="${catCls}">${catLbl}</span></td>
        <td>${p.price_before?`<span style="text-decoration:line-through;color:var(--mu)">${p.price_before}</span>`:'-'}</td>
        <td style="color:var(--g);font-weight:700">${p.price} <small style="font-weight:400;color:var(--mu)">${t('aed')}</small></td>
        <td>${disc?`<span style="color:var(--re);font-weight:700">-${disc}%</span>`:'-'}</td>
        <td style="${p.stock<=3?'color:var(--re)':''}">${p.stock}</td>
        <td><span class="${active?'badge-on':'badge-off'}">${active?(lang==='ar'?'نشط':'Active'):(lang==='ar'?'مخفي':'Hidden')}</span></td>
        <td><div class="act-row">
          <button class="btn-sm btn-edit" onclick="openPF(${p.id})">✏️</button>
          <button class="btn-sm btn-del" onclick="delProd(${p.id})">🗑</button>
          <button class="btn-sm btn-wa-sm" onclick="waProduct(${p.id})" title="WhatsApp">📱</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

async function loadAdmOrds() {
  const r = await api('GET', `${BASE}/orders.php`);
  const el = document.getElementById('admBody'); if(!el) return;
  if (!r.ok||!Array.isArray(r.data)) {
    el.innerHTML = `<div style="padding:20px;color:var(--mu)">${r.msg||'Error'}</div>`;
    return;
  }
  const sts=['pending','confirmed','shipped','delivered','cancelled'];
  const scls={pending:'sp',confirmed:'sc2',shipped:'ss',delivered:'sd',cancelled:'sx'};
  el.innerHTML = `
    <div class="adm-search">
      <span class="sic">🔍</span>
      <input placeholder="${lang==='ar'?'بحث في الطلبات...':'Search orders...'}" oninput="filterOrdsTable(this.value, ${JSON.stringify(r.data).replace(/"/g,'&quot;')})">
    </div>
    <div id="ordsTableWrap" class="tw">
      ${renderOrdsTable(r.data, sts, scls)}
    </div>`;
}

function filterOrdsTable(q, data) {
  const filtered = data.filter(o =>
    String(o.id).includes(q) ||
    (o.user_name||'').toLowerCase().includes(q.toLowerCase()) ||
    (o.address||'').toLowerCase().includes(q.toLowerCase())
  );
  const wrap = document.getElementById('ordsTableWrap');
  const sts=['pending','confirmed','shipped','delivered','cancelled'];
  const scls={pending:'sp',confirmed:'sc2',shipped:'ss',delivered:'sd',cancelled:'sx'};
  if (wrap) wrap.innerHTML = renderOrdsTable(filtered, sts, scls);
}

function renderOrdsTable(data, sts, scls) {
  if (!data.length) return `<div class="adm-empty"><div class="ei">🧾</div><p>${lang==='ar'?'لا توجد طلبات':'No orders'}</p></div>`;
  return `<table>
    <thead><tr>
      <th>#</th>
      <th>${lang==='ar'?'العميل':'Customer'}</th>
      <th>${lang==='ar'?'الإجمالي':'Total'}</th>
      <th>${lang==='ar'?'الحالة':'Status'}</th>
      <th>${lang==='ar'?'التاريخ':'Date'}</th>
      <th>${lang==='ar'?'تحديث':'Update'}</th>
      <th>${lang==='ar'?'إجراء':'Action'}</th>
    </tr></thead>
    <tbody>${data.map(o=>`<tr>
      <td style="color:var(--g);font-weight:700">#${o.id}</td>
      <td>
        <div style="color:var(--tx);font-weight:500">${escHtml(o.user_name||'-')}</div>
        ${o.email?`<div style="font-size:10px;color:var(--mu)">${escHtml(o.email)}</div>`:''}
      </td>
      <td style="color:var(--g);font-weight:700">${Number(o.total).toFixed(0)} <small style="color:var(--mu);font-weight:400">${t('aed')}</small></td>
      <td><span class="ost ${scls[o.status]||'sp'}">${ts(o.status)}</span></td>
      <td style="white-space:nowrap">${o.created_at?.slice(0,10)||''}</td>
      <td>
        <select class="st-sel" onchange="updOrdSt(${o.id},this.value)">
          ${sts.map(s=>`<option value="${s}"${o.status===s?' selected':''}>${ts(s)}</option>`).join('')}
        </select>
      </td>
      <td><div class="act-row">
        <button class="btn-sm btn-view" onclick='showOrdDetail(${JSON.stringify(o).replace(/'/g,"&#39;")})'>${lang==='ar'?'عرض':'View'}</button>
        <button class="btn-sm btn-wa-sm" onclick='waOrderAdmin(${JSON.stringify(o).replace(/'/g,"&#39;")})'>📱</button>
      </div></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function showOrdDetail(o) {
  const scls={pending:'sp',confirmed:'sc2',shipped:'ss',delivered:'sd',cancelled:'sx'};
  const items = (o.items||[]).map(i=>`
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div>
        <div style="font-size:13px;color:var(--tx)">${escHtml(lang==='ar'?i.name_ar:i.name_en)}</div>
        <div style="font-size:11px;color:var(--mu)">${lang==='ar'?'الكمية':'Qty'}: ${i.qty}</div>
      </div>
      <div style="font-size:13px;color:var(--g);font-weight:700">${(i.price*i.qty).toFixed(0)} ${t('aed')}</div>
    </div>`).join('');
  
  document.getElementById('ordDetailTitle').textContent = `${lang==='ar'?'طلب رقم':'Order'} #${o.id}`;
  document.getElementById('ordDetailBody').innerHTML = `
    <div style="margin-bottom:12px">
      <span class="ost ${scls[o.status]||'sp'}">${ts(o.status)}</span>
      <span style="font-size:11px;color:var(--mu);margin-${lang==='ar'?'right':'left'}:8px">${o.created_at?.slice(0,16)||''}</span>
    </div>
    <div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">${lang==='ar'?'العميل':'Customer'}</div>
      <div style="font-weight:600">${escHtml(o.user_name||'-')}</div>
      ${o.email?`<div style="font-size:12px;color:var(--mu)">${escHtml(o.email)}</div>`:''}
    </div>
    ${o.address?`<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">📍 ${lang==='ar'?'العنوان':'Address'}</div>
      <div style="font-size:13px">${escHtml(o.address)}</div>
    </div>`:''}
    ${o.notes?`<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">📝 ${lang==='ar'?'ملاحظات':'Notes'}</div>
      <div style="font-size:13px">${escHtml(o.notes)}</div>
    </div>`:''}
    <div style="margin-bottom:12px">${items}</div>
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid rgba(201,168,76,.2)">
      <span style="font-size:15px;font-weight:700;color:var(--g)">${lang==='ar'?'الإجمالي':'Total'}</span>
      <span style="font-size:17px;font-weight:800;color:var(--g)">${Number(o.total).toFixed(2)} ${t('aed')}</span>
    </div>
    <button class="btn-wa" style="width:100%;justify-content:center;gap:8px;font-size:14px" onclick='waOrderAdmin(${JSON.stringify(o).replace(/'/g,"&#39;")})'>
      📱 ${lang==='ar'?'تواصل عبر واتساب':'Contact via WhatsApp'}
    </button>`;
  document.getElementById('ordDetailMod').classList.add('open');
}

async function loadAdmUsers() {
  const r = await api('GET', `${BASE}/users.php`);
  const el = document.getElementById('admBody'); if(!el) return;
  if (!r.ok||!Array.isArray(r.data)) { el.innerHTML=`<div style="padding:20px;color:var(--mu)">${r.msg||'Error'}</div>`; return; }
  el.innerHTML = `
    <div class="adm-search">
      <span class="sic">🔍</span>
      <input placeholder="${lang==='ar'?'بحث في العملاء...':'Search customers...'}" oninput="filterUsersTable(this.value, ${JSON.stringify(r.data).replace(/"/g,'&quot;')})">
    </div>
    <div id="usersTableWrap" class="tw">
      ${renderUsersTable(r.data)}
    </div>`;
}

function filterUsersTable(q, data) {
  const filtered = data.filter(u =>
    u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase())
  );
  const wrap = document.getElementById('usersTableWrap');
  if (wrap) wrap.innerHTML = renderUsersTable(filtered);
}

function renderUsersTable(data) {
  if (!data.length) return `<div class="adm-empty"><div class="ei">👥</div><p>${lang==='ar'?'لا يوجد مستخدمون':'No users found'}</p></div>`;
  return `<table>
    <thead><tr>
      <th>#</th>
      <th>${lang==='ar'?'الاسم':'Name'}</th>
      <th>${lang==='ar'?'البريد الإلكتروني':'Email'}</th>
      <th>${lang==='ar'?'الدور':'Role'}</th>
      <th>${lang==='ar'?'تاريخ التسجيل':'Joined'}</th>
    </tr></thead>
    <tbody>${data.map(u=>`<tr>
      <td style="color:var(--mu)">${u.id}</td>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'var(--g)':'var(--d3)'};color:${u.role==='admin'?'var(--d)':'var(--mu)'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">
            ${escHtml(u.name[0].toUpperCase())}
          </div>
          <span style="color:var(--tx);font-weight:${u.role==='admin'?'700':'400'}">${escHtml(u.name)}</span>
        </div>
      </td>
      <td style="color:var(--mu)">${escHtml(u.email)}</td>
      <td><span class="${u.role==='admin'?'badge-on':''}">
        ${u.role==='admin'?(lang==='ar'?'⚙️ مدير':'⚙️ Admin'):(lang==='ar'?'👤 عميل':'👤 Customer')}
      </span></td>
      <td>${u.created_at?.slice(0,10)||''}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

async function updOrdSt(id, status) {
  const r = await api('PUT', `${BASE}/orders.php?id=${id}`, {status});
  if (r.ok) toast(lang==='ar'?'✓ تم تحديث الحالة':'✓ Status updated','ok');
  else toast(r.msg||'Error','er');
}

function waOrderAdmin(o) {
  const items = (o.items||[]).map(i=>`🫙 *${lang==='ar'?i.name_ar:i.name_en}* × ${i.qty} — ${(i.price*i.qty).toFixed(0)} ${t('aed')}`).join('\n');
  const msg = lang==='ar'
    ? `✨ *متجر TORO للعطور*\n━━━━━━━━━━━━━━━━━━\n📋 *طلب رقم #${o.id}*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━\n💰 *الإجمالي: ${Number(o.total).toFixed(2)} ${t('aed')}*\n👤 العميل: ${o.user_name||'—'}\n📍 العنوان: ${o.address||'—'}\n💳 الدفع عند الاستلام`
    : `✨ *TORO Perfume Store*\n━━━━━━━━━━━━━━━━━━\n📋 *Order #${o.id}*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━\n💰 *Total: ${Number(o.total).toFixed(2)} ${t('aed')}*\n👤 Customer: ${o.user_name||'—'}\n📍 Address: ${o.address||'—'}\n💳 Cash on Delivery`;
  window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Product Form
function openPF(id=null) {
  const p = id ? prods.find(x=>x.id==id) : null;
  document.getElementById('pfTit').textContent = id
    ? (lang==='ar'?'✏️ تعديل المنتج':'✏️ Edit Product')
    : (lang==='ar'?'+ إضافة منتج جديد':'+ Add New Product');
  document.getElementById('f_id').value  = id||'';
  document.getElementById('f_nar').value = p?.name_ar||'';
  document.getElementById('f_nen').value = p?.name_en||'';
  document.getElementById('f_br').value  = p?.brand||'';
  document.getElementById('f_or').value  = p?.origin||'';
  document.getElementById('f_cat').value = p?.category||'men';
  document.getElementById('f_pr').value  = p?.price||'';
  document.getElementById('f_pb').value  = p?.price_before||'';
  document.getElementById('f_st').value  = p?.stock||'';
  document.getElementById('f_im').value  = p?.image||'';
  document.getElementById('f_ac').value  = (p?.is_active===0||p?.is_active==='0')?'0':'1';
  document.getElementById('f_dar').value = p?.description_ar||'';
  document.getElementById('f_den').value = p?.description_en||'';
  prevImg();
  document.getElementById('pfMod').classList.add('open');
}
function prevImg() {
  const url = document.getElementById('f_im')?.value?.trim();
  const el  = document.getElementById('imgPrev');
  el.innerHTML = url
    ? `<img src="${escHtml(url)}" onerror="this.parentElement.innerHTML='<span>رابط غير صحيح</span>'">`
    : '<span>معاينة / Preview</span>';
}
async function saveProd() {
  const id = document.getElementById('f_id').value;
  const data = {
    name_ar:        document.getElementById('f_nar').value.trim(),
    name_en:        document.getElementById('f_nen').value.trim(),
    brand:          document.getElementById('f_br').value.trim(),
    origin:         document.getElementById('f_or').value.trim(),
    category:       document.getElementById('f_cat').value,
    price:          parseFloat(document.getElementById('f_pr').value)||0,
    price_before:   parseFloat(document.getElementById('f_pb').value)||null,
    stock:          parseInt(document.getElementById('f_st').value)||0,
    image:          document.getElementById('f_im').value.trim(),
    description_ar: document.getElementById('f_dar').value,
    description_en: document.getElementById('f_den').value,
    is_active:      parseInt(document.getElementById('f_ac').value)
  };
  if (!data.name_ar||!data.name_en||!data.brand||data.price<=0) {
    toast(lang==='ar'?'الاسم والماركة والسعر مطلوبة':'Name, brand and price required','er');
    return;
  }
  const url = id ? `${BASE}/products.php?id=${id}` : `${BASE}/products.php`;
  const r   = await api(id?'PUT':'POST', url, data);
  if (r.ok) {
    cm('pfMod');
    toast(lang==='ar'?'✓ تم الحفظ':'✓ Saved','ok');
    await loadProds();
    if (admCurrentTab==='products') await loadAdmProds();
  } else {
    toast(r.msg||'Error','er');
  }
}
async function delProd(id) {
  if (!confirm(lang==='ar'?'حذف هذا المنتج نهائياً؟':'Delete this product permanently?')) return;
  const r = await api('DELETE', `${BASE}/products.php?id=${id}`);
  if (r.ok) {
    toast(lang==='ar'?'تم الحذف':'Deleted');
    await loadProds();
    if (admCurrentTab==='products') await loadAdmProds();
  } else toast(r.msg||'Error','er');
}

// ══════════════════════════════════════════
// FAVORITES / WISHLIST
// ══════════════════════════════════════════
async function loadFavIds() {
  const tk = localStorage.getItem(LS.TOKEN);
  if (!tk) return;
  const r = await api('GET', `${BASE}/favorites.php`);
  if (r.ok && Array.isArray(r.data)) {
    favIds = new Set(r.data.map(f => f.id));
    // Re-render home if visible to update heart icons
    if (curPg === 'home') renderProds();
  }
}

async function toggleFav(productId) {
  const tk = localStorage.getItem(LS.TOKEN);
  if (!tk) { toast(lang==='ar'?'سجّل دخولك لإضافة للمفضلة':'Login to add to favorites', 'er'); return; }
  const r = await api('POST', `${BASE}/favorites.php`, { product_id: productId });
  if (r.ok) {
    if (r.data.action === 'added') {
      favIds.add(productId);
      toast(lang==='ar'?'❤️ أضيف للمفضلة':'❤️ Added to favorites', 'ok');
    } else {
      favIds.delete(productId);
      toast(lang==='ar'?'🤍 حُذف من المفضلة':'🤍 Removed from favorites');
    }
    renderProds();
    if (curPg === 'favorites') renderFavorites();
  } else {
    toast(r.msg || (lang==='ar'?'خطأ':'Error'), 'er');
  }
}

async function renderFavorites() {
  const el = document.getElementById('favBody');
  if (!el) return;
  const tk = localStorage.getItem(LS.TOKEN);
  if (!tk) {
    el.innerHTML = `<div class="empty" style="padding:60px 20px">
      <div class="ei">🔒</div>
      <p style="margin-bottom:14px">${lang==='ar'?'سجّل دخولك لعرض المفضلة':'Login to view your favorites'}</p>
      <button class="btn-g" onclick="nav('profile')">${lang==='ar'?'تسجيل الدخول':'Login'}</button>
    </div>`;
    return;
  }
  el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';
  const r = await api('GET', `${BASE}/favorites.php`);
  if (!r.ok || !Array.isArray(r.data)) {
    el.innerHTML = `<div class="empty"><div class="ei">💔</div><p>${r.msg||'Error'}</p></div>`;
    return;
  }
  if (!r.data.length) {
    el.innerHTML = `<div class="empty"><div class="ei">🤍</div><p>${lang==='ar'?'لا توجد منتجات في المفضلة':'No favorites yet'}</p></div>`;
    return;
  }
  // Update favIds from response
  favIds = new Set(r.data.map(f => f.id));
  el.innerHTML = `<div class="pgrd">${r.data.map(p => renderProdCard(p)).join('')}</div>`;
}

// ══════════════════════════════════════════
// SECURITY: HTML Escape
// ══════════════════════════════════════════
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

// ══════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════
function cm(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.ov').forEach(m => {
  m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); });
});

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
updBdg();
renderMarquee();  // show DEMO cards immediately while API loads
loadProds();      // update marquee + grid with real data
loadFavIds();
document.querySelectorAll('[data-ar]').forEach(el => el.textContent = el.getAttribute('data-'+lang));
