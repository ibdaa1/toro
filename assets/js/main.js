// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const BASE      = '/api';
const WA_NUM    = '971505931141';
const SITE_URL  = 'https://toroboutique.top';
// Detect mobile/tablet, including iPads in "Request Desktop Site" mode (iOS 13+)
// where the UA reports "Macintosh" but maxTouchPoints reveals touch hardware.
const IS_MOBILE = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Convert a product/page name to a URL-safe slug
function makeSlug(name) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-|-$/g, '') || 'product';
}

// ══════════════════════════════════════════
// SVG ICON CONSTANTS  (inline SVG avoids emoji rendering issues on Android)
// ══════════════════════════════════════════
const SVG = {
  heartEmpty: `<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFull:  `<svg viewBox="0 0 24 24" fill="#d94f4f" stroke="#d94f4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  whatsapp:   `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`
};

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

// Expose lang to i18n.js helpers (t / ts read window._lang)
window._lang = lang;

// Apply saved lang immediately
applyLang();

// ══════════════════════════════════════════
// LANGUAGE
// ══════════════════════════════════════════
function applyLang() {
  window._lang = lang;
  document.body.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('dir', lang==='ar'?'rtl':'ltr');
  document.documentElement.setAttribute('lang', lang);
  const btn = document.getElementById('lbtn');
  if (btn) btn.textContent = lang==='ar'?'EN':'AR';
  applyI18n();
}

// ══════════════════════════════════════════
// I18N APPLICATION
// Reads every [data-i18n], [data-i18n-ph], [data-i18n-label] element and
// fills text / placeholder / aria-label from the i18n.js TR dictionary.
// ══════════════════════════════════════════
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label')));
  });
}

function swLang() {
  lang = lang==='ar' ? 'en' : 'ar';
  localStorage.setItem(LS.LANG, lang);
  applyLang();   // calls applyI18n() internally
  if (_bannerData && _bannerData.length) renderBanners(_bannerData);
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
  if (curPg==='about')     renderAbout();
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
  {id:1,name_ar:'عود الملكي',name_en:'Royal Oud',brand:'Creed',origin:'France',category:'men',price:450,price_before:550,stock:10,image:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80',images_arr:['https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80'],description_ar:'عطر عود فاخر برائحة خشبية غنية ودافئة',description_en:'Luxurious oud with rich warm woody notes'},
  {id:2,name_ar:'روز دو باريس',name_en:'Rose de Paris',brand:'Chanel',origin:'France',category:'women',price:380,price_before:null,stock:15,image:'https://images.unsplash.com/photo-1588514912908-53a8b1010e6a?w=400&q=80',images_arr:['https://images.unsplash.com/photo-1588514912908-53a8b1010e6a?w=400&q=80'],description_ar:'رائحة وردية ناعمة من باريس',description_en:'Soft floral rose from Paris'},
  {id:3,name_ar:'أوريانتال نايت',name_en:'Oriental Night',brand:'TORO',origin:'UAE',category:'unisex',price:290,price_before:350,stock:8,image:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80',images_arr:['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80'],description_ar:'عطر شرقي دافئ بالعنبر والمسك',description_en:'Warm oriental blend with amber and musk'},
  {id:4,name_ar:'مسك الخالص',name_en:'Pure Musk',brand:'Lattafa',origin:'UAE',category:'unisex',price:180,price_before:null,stock:20,image:'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&q=80',images_arr:['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&q=80'],description_ar:'مسك نقي لأناقة يومية',description_en:'Pure musk for everyday elegance'},
  {id:5,name_ar:'جاسمين دريم',name_en:'Jasmine Dream',brand:'YSL',origin:'France',category:'women',price:520,price_before:600,stock:5,image:'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&q=80',images_arr:['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&q=80'],description_ar:'مزيج الياسمين والفانيليا الفاخر',description_en:'Luxurious jasmine and vanilla blend'},
  {id:6,name_ar:'سيدار وود',name_en:'Cedar Wood',brand:'TORO',origin:'UAE',category:'men',price:320,price_before:380,stock:12,image:'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&q=80',images_arr:['https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&q=80'],description_ar:'عطر خشب الأرز بلمسة شرقية',description_en:'Cedar fragrance with oriental touch'},
];

// ══════════════════════════════════════════
// BANNER CAROUSEL
// ══════════════════════════════════════════
let _bannerTimer = null;
let _bannerIdx   = 0;
let _bannerData  = [];

async function loadBanners() {
  const r = await api('GET', `${BASE}/banners.php`);
  if (r.ok && Array.isArray(r.data) && r.data.length) {
    _bannerData = r.data;
    renderBanners(_bannerData);
  }
}

function renderBanners(banners) {
  const carousel = document.getElementById('banner-carousel');
  const staticHero = document.getElementById('static-hero');
  if (!carousel) return;

  // Stop any previous timer
  if (_bannerTimer) { clearInterval(_bannerTimer); _bannerTimer = null; }

  if (!banners || !banners.length) {
    carousel.setAttribute('data-empty', '1');
    if (staticHero) staticHero.style.display = '';
    return;
  }

  // Hide static hero when we have banners
  if (staticHero) staticHero.style.display = 'none';
  carousel.removeAttribute('data-empty');

  // Build slides
  carousel.innerHTML = banners.map((b, i) => {
    const title = lang === 'en' ? (b.title_en || b.title_ar || '') : (b.title_ar || b.title_en || '');
    const sub   = lang === 'en' ? (b.subtitle_en || b.subtitle_ar || '') : (b.subtitle_ar || b.subtitle_en || '');
    const inner = `
      <img src="${escHtml(b.image_url)}" alt="${escHtml(title)}" loading="${i === 0 ? 'eager' : 'lazy'}" onerror="this.style.visibility='hidden'">
      ${title || sub ? `<div class="banner-overlay">${title ? `<div class="banner-title">${escHtml(title)}</div>` : ''}${sub ? `<div class="banner-sub">${escHtml(sub)}</div>` : ''}</div>` : ''}`;
    const slide = b.link
      ? `<a href="${escHtml(b.link)}" class="banner-slide${i === 0 ? ' active' : ''}" target="_blank" rel="noopener noreferrer">${inner}</a>`
      : `<div class="banner-slide${i === 0 ? ' active' : ''}">${inner}</div>`;
    return slide;
  }).join('');

  // Dots
  if (banners.length > 1) {
    const dots = document.createElement('div');
    dots.className = 'banner-dots';
    dots.innerHTML = banners.map((_, i) =>
      `<button class="banner-dot${i === 0 ? ' active' : ''}" onclick="bannerGoTo(${i})" aria-label="Banner ${i+1}"></button>`
    ).join('');
    carousel.appendChild(dots);
  }

  _bannerIdx = 0;
  if (banners.length > 1) {
    _bannerTimer = setInterval(() => bannerNext(banners.length), 4500);
  }
}

function bannerGoTo(idx) {
  const slides = document.querySelectorAll('#banner-carousel .banner-slide');
  const dots   = document.querySelectorAll('#banner-carousel .banner-dot');
  if (!slides.length) return;
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  dots.forEach((d, i)   => d.classList.toggle('active', i === idx));
  _bannerIdx = idx;
}

function bannerNext(total) {
  bannerGoTo((_bannerIdx + 1) % total);
}

async function loadProds() {
  const r = await api('GET', `${BASE}/products.php`);
  prods = (r.ok && Array.isArray(r.data)) ? r.data : [];
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
const MQ_MAX      = 8;  // max cards shown in marquee

function isActiveProduct(p) {
  return p.is_active !== 0 && p.is_active !== '0';
}

function renderMarquee() {
  const track = document.getElementById('mq-track');
  if (!track) return;
  const list = prods.filter(isActiveProduct);
  // If no real products yet, hide the marquee track until data loads
  const src = list.slice(0, MQ_MAX);
  if (!src.length) {
    track.innerHTML = '';
    return;
  }
  const cards = src.map((p, i) => {
    const nm   = lang === 'ar' ? p.name_ar : p.name_en;
    const col  = MQ_COLORS[i % MQ_COLORS.length];
    const imgs = p.images_arr && p.images_arr.length ? p.images_arr : (p.image ? [p.image] : []);
    let imgHtml;
    if (imgs.length > 1) {
      // Multiple images: CSS keyframe slideshow inside the card
      const frames = imgs.map((u, idx) => `<img src="${escHtml(u)}" class="mq-slide mq-slide-${idx}" alt="${escHtml(nm)}" loading="lazy" onerror="this.style.display='none'">`).join('');
      imgHtml = `<div class="mq-slides" data-n="${imgs.length}">${frames}</div>`;
    } else if (imgs.length === 1) {
      imgHtml = `<img src="${escHtml(imgs[0])}" alt="${escHtml(nm)}" loading="lazy" onerror="this.style.display='none'">`;
    } else {
      imgHtml = '<span style="font-size:36px">🫙</span>';
    }
    return `<div class="mq-card" style="box-shadow:0 4px 24px -6px ${col.glow}55" onclick="showProd(${p.id})">
      <div class="mq-img" style="background:radial-gradient(circle at 50% 60%,${col.glow}28 0%,${col.bg} 70%)">${imgHtml}</div>
      <div class="mq-nm">${escHtml(nm)}</div>
      <div class="mq-pr" style="color:${col.glow}">${p.price} <span style="font-size:9px;font-weight:400;color:${col.text}">${t('currency')}</span></div>
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
  const favTitle = isFav ? t('fav_remove') : t('fav_add');
  // SVG heart icons — reliable on all platforms (no emoji dependency)
  const heartSvg = isFav ? SVG.heartFull : SVG.heartEmpty;
  return `
  <div class="pc" style="animation-delay:${i*0.055}s">
    <div class="pim" onclick="showProd(${p.id})">
      ${p.image ? `<img src="${p.image}" alt="${escHtml(nm)}" loading="lazy" onerror="this.style.display='none'">` : '<div class="pfb">🫙</div>'}
      ${disc ? `<div class="dbd">-${disc}%</div>` : ''}
      ${p.stock>0&&p.stock<=3 ? `<div class="sbd">${p.stock} ${t('stock_lbl')}</div>` : ''}
      <button class="fav-btn${isFav?' fav-on':''}" onclick="event.stopPropagation();toggleFav(${p.id})" aria-label="${escHtml(favTitle)}" title="${escHtml(favTitle)}">${heartSvg}</button>
      <div class="prb">
        <div class="prb-row">
          ${p.price_before ? `<span class="prb-was">${p.price_before} ${t('currency')}</span>` : ''}
          <span class="prb-now">${p.price} ${t('currency')}</span>
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
        <span class="pcur">${t('currency')}</span>
        ${disc ? `<span class="pdsc">-${disc}%</span>` : ''}
      </div>
      <div class="cbts">
        <button class="cadd" onclick="addCart(${p.id},1)"><span>${t('add_cart')}</span></button>
        <button class="cwa" onclick="waProduct(${p.id})" title="${escHtml(t('wa_order'))}" aria-label="${escHtml(t('wa_order'))}">
          ${SVG.whatsapp}
        </button>
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
    grid.innerHTML = `<div style="grid-column:1/-1"><div class="empty"><div class="ei">🔍</div><p>${t('no_results')}</p></div></div>`;
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
  const imgs = p.images_arr && p.images_arr.length ? p.images_arr : (p.image ? [p.image] : []);

  // Build image area
  let imgArea = '';
  if (imgs.length > 1) {
    const slides = imgs.map((u,i) => `<img src="${escHtml(u)}" class="pd-slide${i===0?' pd-slide-active':''}" alt="${escHtml(nm)} - ${escHtml(p.brand||'TORO')} ${i+1}" loading="lazy" onerror="this.style.display='none'">`).join('');
    const dots   = imgs.map((_,i) => `<span class="pd-dot${i===0?' pd-dot-active':''}" onclick="pdGoSlide(${i})"></span>`).join('');
    imgArea = `<div class="pdim pd-slider" id="pdSlider">
      ${slides}
      <button class="pd-arr pd-arr-prev" onclick="pdGoSlide(pdSlideIdx-1)">&#8249;</button>
      <button class="pd-arr pd-arr-next" onclick="pdGoSlide(pdSlideIdx+1)">&#8250;</button>
      <div class="pd-dots">${dots}</div>
    </div>`;
  } else {
    imgArea = `<div class="pdim">${imgs[0] ? `<img src="${escHtml(imgs[0])}" alt="${escHtml(nm)} - ${escHtml(p.brand||'TORO')} perfume" loading="lazy" onerror="this.style.display='none'">` : '🫙'}</div>`;
  }

  document.getElementById('pdBody').innerHTML = `
    <div>
      ${imgArea}
      <div class="pdbr">${escHtml(p.brand)}${p.origin?' · '+escHtml(p.origin):''}</div>
      <div class="pdnm">${escHtml(nm)}</div>
      <div class="pdmt">
        ${p.origin ? `🌍 ${t('origin_lbl')}: ${escHtml(p.origin)} &nbsp;·&nbsp; ` : ''}
        📦 ${p.stock>0?(t('in_stock')):(t('out_stock'))}
      </div>
      <div class="pdds">${escHtml(desc) || (t('no_desc'))}</div>
      <div class="pdpc">
        ${p.price_before ? `<span class="pdwas">${p.price_before} ${t('currency')}</span>` : ''}
        <span class="pdnow">${p.price} ${t('currency')}</span>
        ${disc ? `<span class="pdsv">${t('save_lbl')} ${save} ${t('currency')} (${disc}%)</span>` : ''}
      </div>
    </div>`;
  pdSlideIdx = 0;
  pdSlideCount = imgs.length;
  modalProdId = id;
  modalQty = 1;
  document.getElementById('mQty').textContent = 1;
  document.getElementById('pdAddBtn').textContent = t('add_cart');
  document.getElementById('pdMod').classList.add('open');

  // Inject Product structured data for SEO
  const seoImg = imgs.length ? imgs[0] : '';
  const seoSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": nm,
    "description": desc || nm + ' - TORO Boutique fragrance',
    "brand": { "@type": "Brand", "name": p.brand || 'TORO' },
    "image": seoImg ? [seoImg] : [],
    "offers": {
      "@type": "Offer",
      "url": SITE_URL + '/?product=' + encodeURIComponent(p.id),
      "priceCurrency": "AED",
      "price": p.price,
      "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": "TORO Boutique" }
    }
  };
  let ldEl = document.getElementById('__product_ld');
  if (!ldEl) {
    ldEl = document.createElement('script');
    ldEl.id = '__product_ld';
    ldEl.type = 'application/ld+json';
    document.head.appendChild(ldEl);
  }
  ldEl.textContent = JSON.stringify(seoSchema);

  // ── Dynamic title + meta description for SEO ─────────────
  document.title = nm + ' | TORO Boutique';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', (desc ? desc.slice(0,155) : nm) + ' — TORO Boutique');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', nm + ' | TORO Boutique');
  const twtTitle = document.querySelector('meta[name="twitter:title"]');
  if (twtTitle) twtTitle.setAttribute('content', nm + ' | TORO Boutique');

  // ── URL state: push ?product=ID so direct link is sharable ─
  const slug = makeSlug(nm);
  const newUrl = '/?product=' + encodeURIComponent(p.id) + '&name=' + encodeURIComponent(slug);
  if (history.state?.productId !== p.id) {
    history.pushState({ productId: p.id }, '', newUrl);
  }
  const canonEl = document.querySelector('link[rel="canonical"]');
  if (canonEl) canonEl.setAttribute('href', SITE_URL + newUrl);
}

// Restore page title/URL/canonical when product modal is closed
function _restoreSEO() {
  document.title = 'TORO — عطور فاخرة أصيلة | متجر العطور الإماراتي';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', 'متجر TORO للعطور الفاخرة في الإمارات. اكتشف أرقى العطور الرجالية والنسائية من أشهر الماركات العالمية. توصيل سريع لجميع الإمارات.');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', 'TORO — عطور فاخرة أصيلة | TORO Boutique');
  const twtTitle = document.querySelector('meta[name="twitter:title"]');
  if (twtTitle) twtTitle.setAttribute('content', 'TORO Boutique — Luxury Perfumes UAE');
  const canonEl = document.querySelector('link[rel="canonical"]');
  if (canonEl) canonEl.setAttribute('href', SITE_URL + '/');
  if (history.state?.productId) history.pushState({}, '', '/');
}

let pdSlideIdx = 0, pdSlideCount = 1;
function pdGoSlide(idx) {
  if (pdSlideCount <= 1) return;
  pdSlideIdx = ((idx % pdSlideCount) + pdSlideCount) % pdSlideCount;
  const slider = document.getElementById('pdSlider');
  if (!slider) return;
  slider.querySelectorAll('.pd-slide').forEach((el,i) => el.classList.toggle('pd-slide-active', i===pdSlideIdx));
  slider.querySelectorAll('.pd-dot').forEach((el,i)   => el.classList.toggle('pd-dot-active',   i===pdSlideIdx));
}

function chgMQty(d) {
  modalQty = Math.max(1, modalQty+d);
  document.getElementById('mQty').textContent = modalQty;
}
function addFromModal() { addCart(modalProdId, modalQty); cm('pdMod'); }
function waFromModal()  { waProduct(modalProdId, modalQty); cm('pdMod'); }

// ══════════════════════════════════════════
// WHATSAPP MESSAGE BUILDERS
// ══════════════════════════════════════════
const TW = {
  product(lg, p, qty, currency) {
    const name  = lg === 'ar' ? p.name_ar : p.name_en;
    const cur   = currency;
    return lg === 'ar'
      ? `✨ *متجر TORO للعطور*\n━━━━━━━━━━━━━━━━━━\n🫙 *${name}* × ${qty}\n💰 *${(p.price * qty).toFixed(2)} ${cur}*\n━━━━━━━━━━━━━━━━━━`
      : `✨ *TORO Perfume Store*\n━━━━━━━━━━━━━━━━━━\n🫙 *${name}* × ${qty}\n💰 *${(p.price * qty).toFixed(2)} ${cur}*\n━━━━━━━━━━━━━━━━━━`;
  },
  cart(lg, lines, total, currency, addr, notes, phone, locLink) {
    const cur      = currency;
    const itemsStr = lines.join('\n');
    const parts = [
      addr   ? `📍 ${addr}`   : '',
      phone  ? `📞 ${phone}`  : '',
      locLink? `🗺 ${locLink}`: '',
      notes  ? `📝 ${notes}`  : ''
    ].filter(Boolean);
    const extra = parts.join('\n');
    return lg === 'ar'
      ? `✨ *متجر TORO للعطور*\n━━━━━━━━━━━━━━━━━━\n${itemsStr}\n━━━━━━━━━━━━━━━━━━\n💰 *الإجمالي: ${total.toFixed(2)} ${cur}*\n${extra}`.trim()
      : `✨ *TORO Perfume Store*\n━━━━━━━━━━━━━━━━━━\n${itemsStr}\n━━━━━━━━━━━━━━━━━━\n💰 *Total: ${total.toFixed(2)} ${cur}*\n${extra}`.trim();
  },
  adminOrder(lg, o, currency) {
    const cur   = currency;
    const items = (o.items || []).map(i =>
      `🫙 *${lg === 'ar' ? i.name_ar : i.name_en}* × ${i.qty} — ${(i.price * i.qty).toFixed(0)} ${cur}`
    ).join('\n');
    const locLink = (o.latitude && o.longitude) ? `https://maps.google.com/?q=${o.latitude},${o.longitude}` : '';
    return lg === 'ar'
      ? `✨ *متجر TORO للعطور*\n━━━━━━━━━━━━━━━━━━\n📋 *طلب رقم #${o.id}*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━\n💰 *الإجمالي: ${Number(o.total).toFixed(2)} ${cur}*\n👤 ${o.user_name || '—'}\n📍 ${o.address || '—'}${o.phone ? `\n📞 ${o.phone}` : ''}${locLink ? `\n🗺 ${locLink}` : ''}`
      : `✨ *TORO Perfume Store*\n━━━━━━━━━━━━━━━━━━\n📋 *Order #${o.id}*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━\n💰 *Total: ${Number(o.total).toFixed(2)} ${cur}*\n👤 ${o.user_name || '—'}\n📍 ${o.address || '—'}${o.phone ? `\n📞 ${o.phone}` : ''}${locLink ? `\n🗺 ${locLink}` : ''}`;
  }
};

// ══════════════════════════════════════════
// WHATSAPP
// ══════════════════════════════════════════
// Opens WhatsApp app directly on mobile; falls back to web on desktop.
function openWA(phone, msg) {
  const encoded = encodeURIComponent(msg);
  if (IS_MOBILE) {
    // Use deep link to open the WhatsApp app directly
    location.href = `whatsapp://send?phone=${phone}&text=${encoded}`;
  } else {
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  }
}

function waProduct(id, qty=1) {
  const p = prods.find(x=>x.id==id); if(!p) return;
  const msg = TW.product(lang, p, qty, t('currency'));
  openWA(WA_NUM, msg);
}

function buildWaCartUrl() {
  const cart = getCart();
  if (!cart.length) return null;
  const lines = cart.map(c => {
    const p = prods.find(x=>x.id==c.product_id); if(!p) return null;
    const nm = lang==='ar' ? p.name_ar : p.name_en;
    return `🫙 *${nm}* × ${c.qty} — ${(p.price*c.qty).toFixed(0)} ${t('currency')}`;
  }).filter(Boolean);
  const total = calcTotal(cart);
  const addr  = document.getElementById('chkAddr')?.value?.trim() || '';
  const notes = document.getElementById('chkNotes')?.value?.trim() || '';
  const phone = document.getElementById('chkPhone')?.value?.trim() || '';
  const lat   = document.getElementById('chkLat')?.value  || '';
  const lng   = document.getElementById('chkLng')?.value  || '';
  const locLink = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : '';
  const msg = TW.cart(lang, lines, total, t('currency'), addr, notes, phone, locLink);
  return msg;
}

function sendWhatsApp() {
  const msg = buildWaCartUrl();
  if (!msg) { toast(t('cart_empty'),'er'); return; }
  openWA(WA_NUM, msg);
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
  toast(t('added_cart'), 'ok');
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
    el.innerHTML = `<div class="empty"><div class="ei">🛒</div><p>${t('cart_empty')}</p></div>`;
    return;
  }
  const rows = cart.map(c=>{
    const p=prods.find(x=>x.id==c.product_id); if(!p) return '';
    const nm=lang==='ar'?p.name_ar:p.name_en;
    return `<div class="citem">
      <div class="cimg">${p.image?`<img src="${p.image}" onerror="this.style.display='none'">`:'🫙'}</div>
      <div class="cinf">
        <div class="cnm">${escHtml(nm)}</div>
        <div class="cpr">${p.price} ${t('currency')}</div>
        <div class="qr">
          <button class="qb" onclick="chgQty(${p.id},-1)">−</button>
          <span class="qv">${c.qty}</span>
          <button class="qb" onclick="chgQty(${p.id},1)">+</button>
          <span style="font-size:11px;color:var(--mu);margin-${lang==='ar'?'right':'left'}:auto">= ${(p.price*c.qty).toFixed(0)} ${t('currency')}</span>
        </div>
      </div>
      <button class="rmb" onclick="rmCart(${p.id})">🗑</button>
    </div>`;
  }).join('');
  const sub = calcTotal(cart);
  el.innerHTML = rows + `<div class="csm">
    <div class="sr"><span>${t('subtotal')}</span><span>${sub.toFixed(2)} ${t('currency')}</span></div>
    <div class="sr"><span>${t('shipping')}</span><span style="color:var(--gr)">${t('free')}</span></div>
    <div class="sr tot"><span>${t('total')}</span><span>${sub.toFixed(2)} ${t('currency')}</span></div>
    <div class="cart-btns">
      <button class="btn-g" onclick="goChk()">${t('pg_chk').replace('💳 ','')}</button>
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
  if (!localStorage.getItem(LS.TOKEN)) { toast(t('login_first'),'er'); nav('profile'); return; }
  renderChkSumm(); nav('checkout');
}
function renderChkSumm() {
  const sub = calcTotal(getCart());
  const el = document.getElementById('chkSumm'); if(!el) return;
  el.innerHTML = `<div class="csm">
    <div class="sr"><span>${t('subtotal')}</span><span>${sub.toFixed(2)} ${t('currency')}</span></div>
    <div class="sr"><span>${t('shipping')}</span><span style="color:var(--gr)">${t('free')}</span></div>
    <div class="sr tot"><span>${t('total')}</span><span>${sub.toFixed(2)} ${t('currency')}</span></div>
  </div>`;
}
async function placeOrder() {
  const tk = localStorage.getItem(LS.TOKEN);
  if (!tk) { toast(t('login_first'),'er'); return; }
  const cart = getCart();
  if (!cart.length) { toast(t('cart_empty'),'er'); return; }
  const addr = document.getElementById('chkAddr')?.value?.trim();
  if (!addr) { toast(t('enter_addr'),'er'); return; }
  const phone = document.getElementById('chkPhone')?.value?.trim();
  if (!phone) { toast(t('enter_phone'),'er'); document.getElementById('chkPhone')?.focus(); return; }

  // Build WA message & decide how to send it (app on mobile, web on desktop).
  const waMsg = buildWaCartUrl();
  // Open blank window synchronously on desktop so popup blockers allow it.
  const waWin = (!IS_MOBILE && waMsg) ? window.open('', '_blank') : null;

  const btn = document.getElementById('placeBtn');
  btn.disabled=true;
  document.getElementById('t-place').textContent='⏳';
  const r = await api('POST', `${BASE}/orders.php`, {
    items: cart,
    address: addr,
    notes: document.getElementById('chkNotes')?.value||'',
    phone: phone,
    latitude:  document.getElementById('chkLat')?.value  ||null,
    longitude: document.getElementById('chkLng')?.value  ||null
  });
  btn.disabled=false;
  document.getElementById('t-place').textContent = t('place_order');
  if (r.ok) {
    setCart([]);
    updBdg();
    toast(t('order_ok'),'ok');
    if (waMsg) {
      if (IS_MOBILE) {
        openWA(WA_NUM, waMsg);
      } else if (waWin) {
        waWin.location.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(waMsg)}`;
      }
    }
    document.getElementById('chkAddr').value='';
    document.getElementById('chkNotes').value='';
    document.getElementById('chkPhone').value='';
    document.getElementById('chkLat').value='';
    document.getElementById('chkLng').value='';
    document.getElementById('locStatus').textContent='';
    nav('orders');
  } else {
    if (waWin) waWin.close();
    toast(r.msg||t('error_lbl'),'er');
    // If token invalid, redirect to login
    if (r.msg && r.msg.includes('nauthorized')) { toast(t('login_first'),'er'); nav('profile'); }
  }
}

// ══════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════
async function renderOrders() {
  const el = document.getElementById('ordBody'); if(!el) return;
  if (!localStorage.getItem(LS.TOKEN)) {
    el.innerHTML = `<div class="empty"><div class="ei">🔐</div><p>${t('login_first')}</p></div>`;
    return;
  }
  el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';
  const r = await api('GET', `${BASE}/orders.php`);
  if (!r.ok || !r.data?.length) {
    el.innerHTML = `<div class="empty"><div class="ei">📦</div><p>${t('no_orders')}</p></div>`;
    return;
  }
  const scls = {pending:'sp',confirmed:'sc2',shipped:'ss',delivered:'sd',cancelled:'sx'};
  const trackSteps = ['pending','confirmed','shipped','delivered'];
  el.innerHTML = r.data.map(o=>{
    const isCancelled = o.status === 'cancelled';
    const stepIdx = trackSteps.indexOf(o.status);
    const tracker = isCancelled
      ? `<div class="ord-tracker cancelled"><span>${ts('cancelled')}</span></div>`
      : `<div class="ord-tracker">
          ${trackSteps.map((s,i)=>`
            <div class="trk-step${i <= stepIdx ? ' done' : ''}">
              <div class="trk-dot"></div>
              <div class="trk-lbl">${ts(s)}</div>
            </div>
            ${i < trackSteps.length-1 ? `<div class="trk-line${i < stepIdx ? ' done' : ''}"></div>` : ''}
          `).join('')}
        </div>`;
    return `
    <div class="oc">
      <div class="oh">
        <span class="oid">#${o.id} · ${o.created_at?.slice(0,10)||''}</span>
        <span class="ost ${scls[o.status]||'sp'}">${ts(o.status)}</span>
      </div>
      <div class="oit">${(o.items||[]).map(i=>`${escHtml(lang==='ar'?i.name_ar:i.name_en)} × ${i.qty}`).join(' / ')}</div>
      <div class="otot">${Number(o.total).toFixed(2)} ${t('currency')}</div>
      ${o.address?`<div style="font-size:11px;color:var(--mu);margin-top:5px">📍 ${escHtml(o.address)}</div>`:''}
      ${tracker}
    </div>`;
  }).join('');
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
        <button class="bol" onclick="nav('orders')">${t('my_orders')}</button>
        ${u.role==='admin'?`<a class="bol" href="admin/index.html" style="display:inline-block">${t('admin_panel')}</a>`:''}
        <br><br>
        <button class="bdr" onclick="doLogout()">${t('logout_btn')}</button>
      </div>
    </div></div>`;
  } else {
    el.innerHTML = `<div class="aw"><div class="ac">
      <div class="alo"><div class="alt">TORO</div></div>
      <div class="atbs">
        <button class="atb2 on" onclick="aTab('login',this)">${t('login_btn')}</button>
        <button class="atb2" onclick="aTab('reg',this)">${t('register_btn')}</button>
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
    <div class="fg"><label class="fl">${escHtml(t('email_lbl'))}</label>
      <input class="fi" id="lEm" type="email" placeholder="example@email.com" autocomplete="email" maxlength="150"></div>
    <div class="fg"><label class="fl">${escHtml(t('pass_lbl'))}</label>
      <input class="fi" id="lPw" type="password" placeholder="••••••••" autocomplete="current-password"></div>
    <button class="btn-g" style="width:100%" onclick="doLogin()">${t('login_btn')}</button>`;
}
function showReg() {
  document.getElementById('aForm').innerHTML = `
    <div class="fg"><label class="fl">${escHtml(t('name_lbl'))}</label>
      <input class="fi" id="rNm" placeholder="${escHtml(t('name_ph'))}" autocomplete="name" maxlength="100"></div>
    <div class="fg"><label class="fl">${escHtml(t('email_lbl'))}</label>
      <input class="fi" id="rEm" type="email" placeholder="example@email.com" autocomplete="email" maxlength="150"></div>
    <div class="fg"><label class="fl">${escHtml(t('pass_hint_lbl'))}</label>
      <input class="fi" id="rPw" type="password" placeholder="••••••••" autocomplete="new-password"></div>
    <button class="btn-g" style="width:100%" onclick="doReg()">${t('create_acc')}</button>`;
}
async function doLogin() {
  const em = document.getElementById('lEm')?.value?.trim();
  const pw = document.getElementById('lPw')?.value;
  if (!em||!pw) { toast(t('enter_creds'),'er'); return; }
  const r = await api('POST', `${BASE}/auth.php?action=login`, {email:em, password:pw});
  if (r.ok && r.data?.token) {
    localStorage.setItem(LS.TOKEN, r.data.token);
    localStorage.setItem(LS.USER, JSON.stringify(r.data.user));
    toast((t('welcome'))+r.data.user.name,'ok');
    renderProfile();
  } else {
    toast(r.msg || (t('bad_creds')),'er');
  }
}
async function doReg() {
  const nm = document.getElementById('rNm')?.value?.trim();
  const em = document.getElementById('rEm')?.value?.trim();
  const pw = document.getElementById('rPw')?.value;
  if (!nm||!em||!pw) { toast(t('fill_all'),'er'); return; }
  if (pw.length<6) { toast(t('pw_short'),'er'); return; }
  const r = await api('POST', `${BASE}/auth.php?action=register`, {name:nm,email:em,password:pw});
  if (r.ok && r.data?.token) {
    localStorage.setItem(LS.TOKEN, r.data.token);
    localStorage.setItem(LS.USER, JSON.stringify(r.data.user));
    toast(t('acc_created'),'ok');
    renderProfile();
  } else {
    toast(r.msg||t('error_lbl'),'er');
  }
}
function doLogout() {
  localStorage.removeItem(LS.TOKEN);
  localStorage.removeItem(LS.USER);
  toast(t('logged_out'));
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
      <h3>${t('access_denied')}</h3>
      <p>${t('admin_only')}</p>
      <br>
      <button class="btn-g" style="margin:0 auto;display:block;width:fit-content;padding:12px 24px" onclick="nav('profile')">${t('login_btn')}</button>
    </div>`;
    return;
  }

  el.innerHTML = `
    <div class="adm-wrap">
      <div class="adm-stats" id="admStats"><div class="ldw"><div class="ld"></div></div></div>
      <div class="adm-tabs" id="admTabs">
        <button class="adm-tab on" onclick="admTab('products',this)">${t('adm_products')}</button>
        <button class="adm-tab" onclick="admTab('orders',this)">${t('adm_orders')}</button>
        <button class="adm-tab" onclick="admTab('users',this)">${t('adm_users')}</button>
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
      <div class="stat-lbl">${t('stat_prods')}</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-icon">🧾</div>
      <div class="stat-val">${s.total_orders}</div>
      <div class="stat-lbl">${t('stat_orders')}</div>
      ${s.pending_orders>0?`<div style="font-size:10px;color:var(--or);margin-top:4px">⏳ ${s.pending_orders} ${t('adm_pend')}</div>`:''}
    </div>
    <div class="stat-card green">
      <div class="stat-icon">👥</div>
      <div class="stat-val">${s.total_users}</div>
      <div class="stat-lbl">${t('stat_users')}</div>
    </div>
    <div class="stat-card orange">
      <div class="stat-icon">💰</div>
      <div class="stat-val">${rev.toFixed(0)}</div>
      <div class="stat-lbl">${t('stat_rev')}</div>
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
      ${t('adm_add_prod')}
    </button>
    <div class="adm-search">
      <span class="sic">🔍</span>
      <input placeholder="${t('adm_srch_prod')}" oninput="admProdSearch(this.value)" value="${admSearchQ}">
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
  if (!list.length) return `<div class="adm-empty"><div class="ei">📦</div><p>${t('adm_no_prods')}</p></div>`;
  const scls = {men:'cat-m',women:'cat-w',unisex:'cat-u'};
  const catMap = {men:'cat_men',women:'cat_women',unisex:'cat_unisex'};
  return `<table>
    <thead><tr>
      <th>📷</th>
      <th>${t('th_product')}</th>
      <th>${t('th_brand')}</th>
      <th>${t('th_category')}</th>
      <th>${t('th_before')}</th>
      <th>${t('th_after')}</th>
      <th>${t('th_disc')}</th>
      <th>${t('th_stock')}</th>
      <th>${t('th_status')}</th>
      <th>${t('th_action')}</th>
    </tr></thead>
    <tbody>${list.map(p=>{
      const disc = p.price_before?Math.round((1-p.price/p.price_before)*100):0;
      const nm = lang==='ar'?p.name_ar:p.name_en;
      const catCls = scls[p.category]||'cat-u';
      const catLbl = t(catMap[p.category]||'cat_unisex');
      const active = p.is_active==1||p.is_active===undefined;
      return `<tr>
        <td><div class="prod-thumb">
          ${p.image?`<img src="${p.image}" onerror="this.style.display='none'">` : '🫙'}
        </div></td>
        <td data-label="${escHtml(t('th_product'))}" style="color:var(--tx);max-width:140px">
          <div style="font-weight:500">${escHtml(nm)}</div>
          ${p.origin?`<div style="font-size:10px;color:var(--mu);margin-top:2px">🌍 ${escHtml(p.origin)}</div>`:''}
        </td>
        <td data-label="${escHtml(t('th_brand'))}" style="color:var(--tx);font-weight:500">${escHtml(p.brand)}</td>
        <td data-label="${escHtml(t('th_category'))}"><span class="${catCls}">${catLbl}</span></td>
        <td data-label="${escHtml(t('th_before'))}">${p.price_before?`<span style="text-decoration:line-through;color:var(--mu)">${p.price_before}</span>`:'-'}</td>
        <td data-label="${escHtml(t('th_after'))}" style="color:var(--g);font-weight:700">${p.price} <small style="font-weight:400;color:var(--mu)">${t('currency')}</small></td>
        <td data-label="${escHtml(t('th_disc'))}">${disc?`<span style="color:var(--re);font-weight:700">-${disc}%</span>`:'-'}</td>
        <td data-label="${escHtml(t('th_stock'))}" style="${p.stock<=3?'color:var(--re)':''}">${p.stock}</td>
        <td data-label="${escHtml(t('th_status'))}"><span class="${active?'badge-on':'badge-off'}">${active?t('status_on'):t('status_off')}</span></td>
        <td data-label="${escHtml(t('th_action'))}"><div class="act-row">
          <button class="btn-sm btn-edit" onclick="openPF(${p.id})">✏️</button>
          <button class="btn-sm btn-del" onclick="delProd(${p.id})">🗑</button>
          <button class="btn-sm btn-wa-sm" onclick="waProduct(${p.id})" title="${escHtml(t('wa_order'))}">📱</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

async function loadAdmOrds() {
  const r = await api('GET', `${BASE}/orders.php`);
  const el = document.getElementById('admBody'); if(!el) return;
  if (!r.ok||!Array.isArray(r.data)) {
    el.innerHTML = `<div style="padding:20px;color:var(--mu)">${r.msg||t('error_lbl')}</div>`;
    return;
  }
  const sts=['pending','confirmed','shipped','delivered','cancelled'];
  const scls={pending:'sp',confirmed:'sc2',shipped:'ss',delivered:'sd',cancelled:'sx'};
  el.innerHTML = `
    <div class="adm-search">
      <span class="sic">🔍</span>
      <input placeholder="${t('adm_srch_ord')}" oninput="filterOrdsTable(this.value, ${JSON.stringify(r.data).replace(/"/g,'&quot;')})">
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
  if (!data.length) return `<div class="adm-empty"><div class="ei">🧾</div><p>${t('adm_no_ords')}</p></div>`;
  return `<table>
    <thead><tr>
      <th>#</th>
      <th>${t('th_customer')}</th>
      <th>${t('th_ttl')}</th>
      <th>${t('th_status')}</th>
      <th>${t('th_date')}</th>
      <th>${t('th_update')}</th>
      <th>${t('th_action')}</th>
    </tr></thead>
    <tbody>${data.map(o=>`<tr>
      <td data-label="${escHtml(t('th_id'))}" style="color:var(--g);font-weight:700">#${o.id}</td>
      <td data-label="${escHtml(t('th_customer'))}">
        <div style="color:var(--tx);font-weight:500">${escHtml(o.user_name||'-')}</div>
        ${o.email?`<div style="font-size:10px;color:var(--mu)">${escHtml(o.email)}</div>`:''}
      </td>
      <td data-label="${escHtml(t('th_ttl'))}" style="color:var(--g);font-weight:700">${Number(o.total).toFixed(0)} <small style="color:var(--mu);font-weight:400">${t('currency')}</small></td>
      <td data-label="${escHtml(t('th_status'))}"><span class="ost ${scls[o.status]||'sp'}">${ts(o.status)}</span></td>
      <td data-label="${escHtml(t('th_date'))}" style="white-space:nowrap">${o.created_at?.slice(0,10)||''}</td>
      <td data-label="${escHtml(t('th_update'))}">
        <select class="st-sel" onchange="updOrdSt(${o.id},this.value)">
          ${sts.map(s=>`<option value="${s}"${o.status===s?' selected':''}>${ts(s)}</option>`).join('')}
        </select>
      </td>
      <td data-label="${escHtml(t('th_action'))}"><div class="act-row">
        <button class="btn-sm btn-view" onclick='showOrdDetail(${JSON.stringify(o).replace(/'/g,"&#39;")})'>${t('view_lbl')}</button>
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
        <div style="font-size:11px;color:var(--mu)">${t('qty_lbl')}: ${i.qty}</div>
      </div>
      <div style="font-size:13px;color:var(--g);font-weight:700">${(i.price*i.qty).toFixed(0)} ${t('currency')}</div>
    </div>`).join('');
  
  document.getElementById('ordDetailTitle').textContent = `${t('order_no')} #${o.id}`;
  document.getElementById('ordDetailBody').innerHTML = `
    <div style="margin-bottom:12px">
      <span class="ost ${scls[o.status]||'sp'}">${ts(o.status)}</span>
      <span style="font-size:11px;color:var(--mu);margin-${lang==='ar'?'right':'left'}:8px">${o.created_at?.slice(0,16)||''}</span>
    </div>
    <div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">${t('th_customer')}</div>
      <div style="font-weight:600">${escHtml(o.user_name||'-')}</div>
      ${o.email?`<div style="font-size:12px;color:var(--mu)">${escHtml(o.email)}</div>`:''}
    </div>
    ${o.address?`<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">📍 ${t('address_lbl2')}</div>
      <div style="font-size:13px">${escHtml(o.address)}</div>
    </div>`:''}
    ${o.phone?`<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">📞 ${t('phone_lbl2')}</div>
      <div style="font-size:13px">${escHtml(o.phone)}</div>
    </div>`:''}
    ${(o.latitude&&o.longitude)?`<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">🗺 ${t('location_lbl')}</div>
      <a href="https://maps.google.com/?q=${o.latitude},${o.longitude}" target="_blank" style="font-size:13px;color:var(--bl);text-decoration:underline">${t('open_map')}</a>
    </div>`:''}
    ${o.notes?`<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">📝 ${t('notes_lbl2')}</div>
      <div style="font-size:13px">${escHtml(o.notes)}</div>
    </div>`:''}
    <div style="margin-bottom:12px">${items}</div>
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid rgba(201,168,76,.2)">
      <span style="font-size:15px;font-weight:700;color:var(--g)">${t('th_ttl')}</span>
      <span style="font-size:17px;font-weight:800;color:var(--g)">${Number(o.total).toFixed(2)} ${t('currency')}</span>
    </div>
    <button class="btn-wa" style="width:100%;justify-content:center;gap:8px;font-size:14px" onclick='waOrderAdmin(${JSON.stringify(o).replace(/'/g,"&#39;")})'>
      📱 ${t('wa_contact')}
    </button>`;
  document.getElementById('ordDetailMod').classList.add('open');
}

async function loadAdmUsers() {
  const r = await api('GET', `${BASE}/users.php`);
  const el = document.getElementById('admBody'); if(!el) return;
  if (!r.ok||!Array.isArray(r.data)) { el.innerHTML=`<div style="padding:20px;color:var(--mu)">${r.msg||t('error_lbl')}</div>`; return; }
  el.innerHTML = `
    <div class="adm-search">
      <span class="sic">🔍</span>
      <input placeholder="${t('adm_srch_usr')}" oninput="filterUsersTable(this.value, ${JSON.stringify(r.data).replace(/"/g,'&quot;')})">
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
  if (!data.length) return `<div class="adm-empty"><div class="ei">👥</div><p>${t('adm_no_usrs')}</p></div>`;
  return `<table>
    <thead><tr>
      <th>#</th>
      <th>${t('th_name')}</th>
      <th>${t('th_email')}</th>
      <th>${t('th_role')}</th>
      <th>${t('th_joined')}</th>
    </tr></thead>
    <tbody>${data.map(u=>`<tr>
      <td data-label="${escHtml(t('th_id'))}" style="color:var(--mu)">${u.id}</td>
      <td data-label="${escHtml(t('th_name'))}">
        <div style="display:flex;align-items:center;gap:9px">
          <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'var(--g)':'var(--d3)'};color:${u.role==='admin'?'var(--d)':'var(--mu)'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">
            ${escHtml(u.name[0].toUpperCase())}
          </div>
          <span style="color:var(--tx);font-weight:${u.role==='admin'?'700':'400'}">${escHtml(u.name)}</span>
        </div>
      </td>
      <td data-label="${escHtml(t('th_email'))}" style="color:var(--mu)">${escHtml(u.email)}</td>
      <td data-label="${escHtml(t('th_role'))}"><span class="${u.role==='admin'?'badge-on':''}">
        ${u.role==='admin'?(t('role_admin')):(t('role_cust'))}
      </span></td>
      <td data-label="${escHtml(t('th_joined'))}">${u.created_at?.slice(0,10)||''}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

async function updOrdSt(id, status) {
  const r = await api('PUT', `${BASE}/orders.php?id=${id}`, {status});
  if (r.ok) toast(t('adm_st_upd'),'ok');
  else toast(r.msg||t('error_lbl'),'er');
}

function waOrderAdmin(o) {
  const msg = TW.adminOrder(lang, o, t('currency'));
  openWA(WA_NUM, msg);
}

// Product Form
function openPF(id=null) {
  const p = id ? prods.find(x=>x.id==id) : null;
  document.getElementById('pfTit').textContent = id ? t('adm_edit_prod') : t('adm_new_prod');
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
    ? `<img src="${escHtml(url)}" onerror="this.parentElement.innerHTML='<span>${escHtml(t('bad_link'))}</span>'">`
    : `<span>${escHtml(t('preview_lbl'))}</span>`;
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
    toast(t('adm_prod_required'),'er');
    return;
  }
  const url = id ? `${BASE}/products.php?id=${id}` : `${BASE}/products.php`;
  const r   = await api(id?'PUT':'POST', url, data);
  if (r.ok) {
    cm('pfMod');
    toast(t('adm_saved'),'ok');
    await loadProds();
    if (admCurrentTab==='products') await loadAdmProds();
  } else {
    toast(r.msg||t('error_lbl'),'er');
  }
}
async function delProd(id) {
  if (!confirm(t('adm_del_conf'))) return;
  const r = await api('DELETE', `${BASE}/products.php?id=${id}`);
  if (r.ok) {
    toast(t('adm_deleted'));
    await loadProds();
    if (admCurrentTab==='products') await loadAdmProds();
  } else toast(r.msg||t('error_lbl'),'er');
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
  if (!tk) { toast(t('fav_login'), 'er'); return; }
  const r = await api('POST', `${BASE}/favorites.php`, { product_id: productId });
  if (r.ok) {
    if (r.data.action === 'added') {
      favIds.add(productId);
      toast(t('fav_added'), 'ok');
    } else {
      favIds.delete(productId);
      toast(t('fav_removed'));
    }
    renderProds();
    if (curPg === 'favorites') renderFavorites();
  } else {
    toast(r.msg || t('error_lbl'), 'er');
  }
}

async function renderFavorites() {
  const el = document.getElementById('favBody');
  if (!el) return;
  const tk = localStorage.getItem(LS.TOKEN);
  if (!tk) {
    el.innerHTML = `<div class="empty" style="padding:60px 20px">
      <div class="ei">🔒</div>
      <p style="margin-bottom:14px">${t('fav_login2')}</p>
      <button class="btn-g" onclick="nav('profile')">${t('login_btn')}</button>
    </div>`;
    return;
  }
  el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';
  const r = await api('GET', `${BASE}/favorites.php`);
  if (!r.ok || !Array.isArray(r.data)) {
    el.innerHTML = `<div class="empty"><div class="ei">💔</div><p>${r.msg||t('error_lbl')}</p></div>`;
    return;
  }
  if (!r.data.length) {
    el.innerHTML = `<div class="empty"><div class="ei">🤍</div><p>${t('fav_empty')}</p></div>`;
    return;
  }
  // Update favIds from response
  favIds = new Set(r.data.map(f => f.id));
  el.innerHTML = `<div class="pgrd">${r.data.map(p => renderProdCard(p)).join('')}</div>`;
}

// ══════════════════════════════════════════
// ABOUT US PAGE
// ══════════════════════════════════════════
function renderAbout() {
  const el = document.getElementById('aboutBody'); if (!el) return;
  el.innerHTML = `
    <div class="about-wrap">
      <!-- Hero banner -->
      <div class="about-hero">
        <div class="about-logo">TORO</div>
        <div class="about-tagline">${escHtml(t('about_tagline'))}</div>
      </div>

      <!-- Story -->
      <div class="about-card">
        <div class="about-sec-title">📖 ${escHtml(t('about_story_title'))}</div>
        <p class="about-text">${escHtml(t('about_story'))}</p>
      </div>

      <!-- Values -->
      <div class="about-vals">
        <div class="about-val-card">
          <div class="about-val-ic">✨</div>
          <div class="about-val-title">${escHtml(t('about_val1_title'))}</div>
          <p class="about-val-text">${escHtml(t('about_val1'))}</p>
        </div>
        <div class="about-val-card">
          <div class="about-val-ic">💬</div>
          <div class="about-val-title">${escHtml(t('about_val2_title'))}</div>
          <p class="about-val-text">${escHtml(t('about_val2'))}</p>
        </div>
        <div class="about-val-card">
          <div class="about-val-ic">🚚</div>
          <div class="about-val-title">${escHtml(t('about_val3_title'))}</div>
          <p class="about-val-text">${escHtml(t('about_val3'))}</p>
        </div>
      </div>

      <!-- Contact -->
      <div class="about-card about-contact">
        <div class="about-sec-title">📞 ${escHtml(t('about_contact_title'))}</div>
        <a class="about-cta about-cta-wa"
           href="https://wa.me/${WA_NUM}"
           target="_blank" rel="noopener noreferrer">
          📱 ${escHtml(t('about_wa_cta'))}
        </a>
        <a class="about-cta about-cta-ig"
           href="https://www.instagram.com/toro.designed?igsh=eGRnNmE3dHRscXhi&utm_source=qr"
           target="_blank" rel="noopener noreferrer">
          📸 ${escHtml(t('about_follow'))}
        </a>
      </div>
    </div>`;
}
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
function cm(id) {
  document.getElementById(id)?.classList.remove('open');
  if (id === 'pdMod') _restoreSEO();
}
document.querySelectorAll('.ov').forEach(m => {
  m.addEventListener('click', e => { if(e.target===m) { m.classList.remove('open'); if(m.id==='pdMod') _restoreSEO(); } });
});

// Handle browser back/forward — close product modal when navigating back
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  if (!params.has('product')) {
    document.getElementById('pdMod')?.classList.remove('open');
    _restoreSEO();
  }
});

// ══════════════════════════════════════════
// LOCATION HELPERS
// ══════════════════════════════════════════
function setLocFields(lat, lng) {
  document.getElementById('chkLat').value = lat;
  document.getElementById('chkLng').value = lng;
  document.getElementById('locStatus').textContent = t('loc_selected') + ` (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})`;
}

function getMyLocation() {
  if (!navigator.geolocation) { toast(t('loc_error'), 'er'); return; }
  const btn = document.getElementById('btnGetLoc');
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.disabled = false;
      setLocFields(pos.coords.latitude, pos.coords.longitude);
    },
    () => { btn.disabled = false; toast(t('loc_error'), 'er'); },
    { timeout: 10000 }
  );
}

let _mapInst = null, _mapMarker = null, _pickedLat = null, _pickedLng = null;

function openMapPicker() {
  document.getElementById('mapPickerMod').classList.add('open');
  // Initialize map lazily
  setTimeout(() => {
    const container = document.getElementById('mapPickerContainer');
    if (!container) return;
    const existingLat = parseFloat(document.getElementById('chkLat').value) || 25.2048;
    const existingLng = parseFloat(document.getElementById('chkLng').value) || 55.2708;
    if (_mapInst) {
      _mapInst.setView([existingLat, existingLng], 13);
      _mapInst.invalidateSize();
    } else {
      _mapInst = L.map('mapPickerContainer').setView([existingLat, existingLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(_mapInst);
      _mapInst.on('click', function(e) {
        _pickedLat = e.latlng.lat;
        _pickedLng = e.latlng.lng;
        if (_mapMarker) { _mapMarker.setLatLng(e.latlng); }
        else { _mapMarker = L.marker(e.latlng).addTo(_mapInst); }
      });
    }
    // If already have coords, place marker
    if (document.getElementById('chkLat').value) {
      const ll = L.latLng(existingLat, existingLng);
      _pickedLat = existingLat; _pickedLng = existingLng;
      if (_mapMarker) { _mapMarker.setLatLng(ll); }
      else { _mapMarker = L.marker(ll).addTo(_mapInst); }
    }
  }, 100);
}

function confirmMapLocation() {
  if (_pickedLat === null || _pickedLng === null) {
    toast(t('loc_error'), 'er'); return;
  }
  setLocFields(_pickedLat, _pickedLng);
  cm('mapPickerMod');
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
updBdg();
loadProds().then(() => {
  // Auto-open product if URL contains ?product=ID (e.g., from sitemap or shared link)
  const params = new URLSearchParams(location.search);
  const pid = params.get('product');
  if (pid) showProd(pid);
});
loadBanners();    // load banner carousel from API
loadFavIds();
