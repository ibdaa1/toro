// ═══════════════════════════════════════════════════════
// TORO Admin Panel — admin.js
// ═══════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────────
const BASE   = 'https://qooqz.infinityfreeapp.com/api';
const WA_NUM = '971559740334';

// ── STATE ───────────────────────────────────────────────
const LS = { USER: 'toro_user', TOKEN: 'toro_token', LANG: 'toro_lang' };

let lang          = localStorage.getItem(LS.LANG) || 'ar';
let currentUser   = null;
let currentToken  = null;
let currentSection = 'dashboard';
let allProducts   = [];
let allOrders     = [];
let allUsers      = [];

// ── TRANSLATIONS ─────────────────────────────────────────
const i18n = {
  ar: {
    dashboard: 'لوحة التحكم', products: 'المنتجات', orders: 'الطلبات',
    users: 'العملاء', payments: 'جدول الدفع', stats: 'الإحصائيات',
    addProduct: 'إضافة منتج', editProduct: 'تعديل المنتج', saveProduct: 'حفظ المنتج',
    deleteConfirm: 'حذف هذا المنتج نهائياً؟', saved: '✓ تم الحفظ', deleted: '✓ تم الحذف',
    statusUpdated: '✓ تم تحديث الحالة', error: 'خطأ',
    noProducts: 'لا توجد منتجات', noOrders: 'لا توجد طلبات', noUsers: 'لا يوجد مستخدمون',
    searchProducts: 'بحث في المنتجات...', searchOrders: 'بحث في الطلبات...',
    searchUsers: 'بحث في العملاء...', aed: 'د.إ', totalRevenue: 'إجمالي الإيراد',
    totalOrders: 'إجمالي الطلبات', totalProducts: 'إجمالي المنتجات',
    totalCustomers: 'إجمالي العملاء', pendingOrders: 'طلبات معلقة',
    uploadImage: 'رفع صورة', imageUrl: 'رابط الصورة', clickOrDrop: 'اضغط أو اسحب الصورة هنا',
    imageFormats: 'JPG, PNG, WebP حتى 5MB', uploading: 'جاري الرفع...',
    uploadFailed: 'فشل رفع الصورة', adminOnly: 'هذه الصفحة للمديرين فقط',
    loginFirst: 'يرجى تسجيل الدخول بحساب المدير', goToStore: '← العودة للمتجر',
    recentOrders: 'آخر الطلبات', logout: 'تسجيل الخروج',
    paymentMethod: 'طريقة الدفع', paymentStatus: 'حالة الدفع', scheduledDate: 'تاريخ مجدول',
    cod: 'الدفع عند الاستلام', scheduledPayment: 'دفع مجدول', paid: 'مدفوع',
    pending: 'معلق', confirmed: 'مؤكد', shipped: 'قيد الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
    viewDetails: 'عرض', update: 'تحديث', filter: 'تصفية', all: 'الكل',
    name: 'الاسم', email: 'البريد', role: 'الدور', joined: 'تاريخ التسجيل',
    customer: 'عميل', admin: 'مدير', active: 'نشط', hidden: 'مخفي',
    brand: 'الماركة', category: 'الفئة', price: 'السعر', stock: 'المخزون',
    status: 'الحالة', action: 'إجراء', date: 'التاريخ', customer_col: 'العميل',
    total: 'الإجمالي', before: 'قبل الخصم', after: 'بعد الخصم', disc: 'الخصم',
    image: 'الصورة', product: 'المنتج', orderDetail: 'تفاصيل الطلب',
    address: 'العنوان', notes: 'ملاحظات', qty: 'الكمية', close: 'إغلاق',
    whatsapp: 'واتساب', nameAr: 'الاسم بالعربي', nameEn: 'الاسم بالإنجليزي',
    origin: 'الأصل', descAr: 'الوصف (عربي)', descEn: 'Description (English)',
    priceNow: 'السعر الحالي', priceBefore: 'السعر قبل الخصم', statusLabel: 'الحالة',
    men: 'رجالي', women: 'نسائي', unisex: 'للجنسين',
    payNotes: 'ملاحظة: الدفع حالياً عند الاستلام. الدفع المسبق والمجدول قيد التطوير.',
  },
  en: {
    dashboard: 'Dashboard', products: 'Products', orders: 'Orders',
    users: 'Customers', payments: 'Payment Schedule', stats: 'Statistics',
    addProduct: 'Add Product', editProduct: 'Edit Product', saveProduct: 'Save Product',
    deleteConfirm: 'Delete this product permanently?', saved: '✓ Saved', deleted: '✓ Deleted',
    statusUpdated: '✓ Status updated', error: 'Error',
    noProducts: 'No products found', noOrders: 'No orders', noUsers: 'No users found',
    searchProducts: 'Search products...', searchOrders: 'Search orders...',
    searchUsers: 'Search customers...', aed: 'AED', totalRevenue: 'Total Revenue',
    totalOrders: 'Total Orders', totalProducts: 'Total Products',
    totalCustomers: 'Total Customers', pendingOrders: 'Pending Orders',
    uploadImage: 'Upload Image', imageUrl: 'Image URL', clickOrDrop: 'Click or drag image here',
    imageFormats: 'JPG, PNG, WebP up to 5MB', uploading: 'Uploading...',
    uploadFailed: 'Image upload failed', adminOnly: 'This page is for admins only',
    loginFirst: 'Please login with an admin account', goToStore: '→ Back to Store',
    recentOrders: 'Recent Orders', logout: 'Logout',
    paymentMethod: 'Payment Method', paymentStatus: 'Payment Status', scheduledDate: 'Scheduled Date',
    cod: 'Cash on Delivery', scheduledPayment: 'Scheduled Payment', paid: 'Paid',
    pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
    viewDetails: 'View', update: 'Update', filter: 'Filter', all: 'All',
    name: 'Name', email: 'Email', role: 'Role', joined: 'Joined',
    customer: 'Customer', admin: 'Admin', active: 'Active', hidden: 'Hidden',
    brand: 'Brand', category: 'Category', price: 'Price', stock: 'Stock',
    status: 'Status', action: 'Action', date: 'Date', customer_col: 'Customer',
    total: 'Total', before: 'Before', after: 'After', disc: 'Disc',
    image: 'Image', product: 'Product', orderDetail: 'Order Details',
    address: 'Address', notes: 'Notes', qty: 'Qty', close: 'Close',
    whatsapp: 'WhatsApp', nameAr: 'Name (Arabic)', nameEn: 'Name (English)',
    origin: 'Origin', descAr: 'Description (Arabic)', descEn: 'Description (English)',
    priceNow: 'Current Price', priceBefore: 'Price Before Discount', statusLabel: 'Status',
    men: 'Men', women: 'Women', unisex: 'Unisex',
    payNotes: 'Note: Payment is currently Cash on Delivery. Pre-payment and scheduled payment are under development.',
  }
};

function t(k) { return (i18n[lang] || i18n.ar)[k] || k; }

// ── HELPERS ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

function cm(id) { document.getElementById(id)?.classList.remove('open'); }

function fmtDate(s) { return s ? String(s).slice(0, 10) : '—'; }

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-AE'); }

// ── HTTP ─────────────────────────────────────────────────
async function api(method, url, body = null, isFormData = false) {
  const tk = currentToken || localStorage.getItem(LS.TOKEN);
  const opts = {
    method,
    headers: {}
  };
  if (tk) {
    opts.headers['X-Token'] = tk;
    opts.headers['Authorization'] = 'Bearer ' + tk;
  }
  if (body) {
    if (isFormData) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  try {
    const res = await fetch(url, opts);
    return await res.json();
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

// ── AUTH ─────────────────────────────────────────────────
function loadAuth() {
  try {
    currentUser  = JSON.parse(localStorage.getItem(LS.USER) || 'null');
    currentToken = localStorage.getItem(LS.TOKEN);
  } catch { currentUser = null; currentToken = null; }
}

function isAdmin() {
  return currentUser && currentUser.role === 'admin' && currentToken;
}

function logout() {
  localStorage.removeItem(LS.USER);
  localStorage.removeItem(LS.TOKEN);
  window.location.href = '../index.html';
}

// ── SIDEBAR ──────────────────────────────────────────────
function initSidebar() {
  const items = document.querySelectorAll('.adm-nav-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (section) switchSection(section);
      // close sidebar on mobile
      document.querySelector('.adm-sidebar')?.classList.remove('open');
      document.querySelector('.adm-overlay')?.classList.remove('open');
    });
  });
  document.querySelector('.adm-menu-btn')?.addEventListener('click', () => {
    document.querySelector('.adm-sidebar').classList.toggle('open');
    document.querySelector('.adm-overlay').classList.toggle('open');
  });
  document.querySelector('.adm-overlay')?.addEventListener('click', () => {
    document.querySelector('.adm-sidebar')?.classList.remove('open');
    document.querySelector('.adm-overlay')?.classList.remove('open');
  });
}

function switchSection(section) {
  currentSection = section;
  document.querySelectorAll('.adm-nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.section === section);
  });
  document.querySelectorAll('.adm-section').forEach(s => {
    s.style.display = s.id === 'sec-' + section ? '' : 'none';
  });
  // lazy load sections
  if (section === 'dashboard') loadDashboard();
  else if (section === 'products')  loadProducts();
  else if (section === 'orders')    loadOrders();
  else if (section === 'users')     loadUsers();
  else if (section === 'payments')  loadPayments();
}

// ── CONSTANTS ────────────────────────────────────────────
const REVENUE_TARGET = 100000; // Target revenue in AED for progress bar

// ── DASHBOARD ────────────────────────────────────────────
async function loadDashboard() {
  // Load stats
  const [sr, or_] = await Promise.all([
    api('GET', `${BASE}/stats.php`),
    api('GET', `${BASE}/orders.php`)
  ]);

  if (sr.ok) {
    const d = sr.data;
    document.getElementById('stat-products').textContent = fmtNum(d.total_products);
    document.getElementById('stat-orders').textContent   = fmtNum(d.total_orders);
    document.getElementById('stat-users').textContent    = fmtNum(d.total_users);
    document.getElementById('stat-revenue').textContent  = fmtNum(Math.round(d.revenue));
    document.getElementById('stat-pending').textContent  = fmtNum(d.pending_orders);
    const revBig = document.getElementById('stat-revenue-big');
    if (revBig) revBig.textContent = fmtNum(Math.round(d.revenue));
    // Revenue bar (% of some target, e.g. 100k)
    const pct = Math.min(100, (d.revenue / REVENUE_TARGET) * 100);
    const bar = document.getElementById('rev-bar-fill');
    if (bar) setTimeout(() => bar.style.width = pct + '%', 100);
  }

  // Recent orders
  if (or_.ok && Array.isArray(or_.data)) {
    allOrders = or_.data;
    const recent = or_.data.slice(0, 5);
    const el = document.getElementById('recent-orders-list');
    if (el) {
      if (!recent.length) {
        el.innerHTML = `<div class="empty-state"><div class="ei">🧾</div><p>${t('noOrders')}</p></div>`;
      } else {
        const scls = { pending:'sp', confirmed:'sc2', shipped:'ss', delivered:'sd', cancelled:'sx' };
        el.innerHTML = recent.map(o => `
          <div class="mini-order">
            <div>
              <div class="mini-order-id">#${o.id}</div>
              <div class="mini-order-cust">${escHtml(o.user_name || '—')}</div>
            </div>
            <div style="text-align:center">
              <span class="ost ${scls[o.status] || 'sp'}">${t(o.status)}</span>
              <div style="font-size:10px;color:var(--mu);margin-top:3px">${fmtDate(o.created_at)}</div>
            </div>
            <div class="mini-order-val">${Number(o.total).toFixed(0)} <small style="color:var(--mu)">${t('aed')}</small></div>
          </div>`).join('');
      }
    }
  }
}

// ── PRODUCTS ─────────────────────────────────────────────
async function loadProducts() {
  const el = document.getElementById('prod-table-wrap');
  if (el) el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';

  const r = await api('GET', `${BASE}/products.php`);
  allProducts = (r.ok && Array.isArray(r.data)) ? r.data : [];
  renderProductsTable(allProducts);
}

function renderProductsTable(list) {
  const el = document.getElementById('prod-table-wrap');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">📦</div><p>${t('noProducts')}</p></div>`;
    return;
  }
  const scls = { men:'cat-m', women:'cat-w', unisex:'cat-u' };
  el.innerHTML = `<div class="tw"><table>
    <thead><tr>
      <th>${t('image')}</th>
      <th>${t('product')}</th>
      <th>${t('brand')}</th>
      <th>${t('category')}</th>
      <th>${t('before')}</th>
      <th>${t('after')}</th>
      <th>${t('disc')}</th>
      <th>${t('stock')}</th>
      <th>${t('status')}</th>
      <th>${t('action')}</th>
    </tr></thead>
    <tbody>${list.map(p => {
      const disc  = p.price_before ? Math.round((1 - p.price / p.price_before) * 100) : 0;
      const nm    = lang === 'ar' ? p.name_ar : p.name_en;
      const catLbl = { men: t('men'), women: t('women'), unisex: t('unisex') }[p.category] || p.category;
      const active = p.is_active == 1 || p.is_active === undefined;
      return `<tr>
        <td><div class="prod-thumb">
          ${p.image ? `<img src="${escHtml(p.image)}" onerror="this.style.display='none'">` : '🫙'}
        </div></td>
        <td style="max-width:150px">
          <div style="font-weight:500;color:var(--tx)">${escHtml(nm)}</div>
          ${p.origin ? `<div style="font-size:10px;color:var(--mu)">🌍 ${escHtml(p.origin)}</div>` : ''}
        </td>
        <td style="font-weight:500">${escHtml(p.brand)}</td>
        <td><span class="${scls[p.category] || 'cat-u'}">${catLbl}</span></td>
        <td>${p.price_before ? `<span style="text-decoration:line-through;color:var(--mu)">${p.price_before}</span>` : '—'}</td>
        <td style="color:var(--g);font-weight:700">${p.price} <small style="color:var(--mu)">${t('aed')}</small></td>
        <td>${disc ? `<span style="color:var(--re);font-weight:700">-${disc}%</span>` : '—'}</td>
        <td style="${p.stock <= 3 ? 'color:var(--re)' : ''}">${p.stock}</td>
        <td><span class="${active ? 'badge-on' : 'badge-off'}">${active ? t('active') : t('hidden')}</span></td>
        <td><div class="act-row">
          <button class="btn-sm btn-edit" onclick="openProductForm(${p.id})">✏️</button>
          <button class="btn-sm btn-del"  onclick="deleteProduct(${p.id})">🗑</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

function filterProducts(q) {
  const ql = q.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name_ar.toLowerCase().includes(ql) ||
    p.name_en.toLowerCase().includes(ql) ||
    (p.brand || '').toLowerCase().includes(ql)
  );
  renderProductsTable(filtered);
}

// ── PRODUCT FORM ─────────────────────────────────────────
function openProductForm(id = null) {
  const p = id ? allProducts.find(x => x.id == id) : null;
  document.getElementById('pf-title').textContent = id ? t('editProduct') : t('addProduct');
  document.getElementById('f_id').value    = id || '';
  document.getElementById('f_nar').value   = p?.name_ar || '';
  document.getElementById('f_nen').value   = p?.name_en || '';
  document.getElementById('f_br').value    = p?.brand   || '';
  document.getElementById('f_or').value    = p?.origin  || '';
  document.getElementById('f_cat').value   = p?.category || 'men';
  document.getElementById('f_pr').value    = p?.price   || '';
  document.getElementById('f_pb').value    = p?.price_before || '';
  document.getElementById('f_st').value    = p?.stock   || '';
  document.getElementById('f_im').value    = p?.image   || '';
  document.getElementById('f_ac').value    = (p?.is_active === 0 || p?.is_active === '0') ? '0' : '1';
  document.getElementById('f_dar').value   = p?.description_ar || '';
  document.getElementById('f_den').value   = p?.description_en || '';
  updateImgPreview();
  // Reset upload tab to URL tab
  setImgTab('url');
  document.getElementById('pf-modal').classList.add('open');
}

function updateImgPreview() {
  const url = document.getElementById('f_im')?.value?.trim();
  const el  = document.getElementById('imgPrev');
  if (!el) return;
  el.innerHTML = url
    ? `<img src="${escHtml(url)}" onerror="this.parentElement.innerHTML='<span style=\'color:var(--re)\'>رابط غير صحيح / Invalid URL</span>'">`
    : `<span>${lang === 'ar' ? 'معاينة' : 'Preview'}</span>`;
}

function setImgTab(tab) {
  document.querySelectorAll('.img-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('img-url-section').style.display  = tab === 'url'    ? '' : 'none';
  document.getElementById('img-file-section').style.display = tab === 'upload' ? '' : 'none';
}

async function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const dropZone = document.getElementById('img-drop-zone');
  const statusEl = document.getElementById('upload-status');
  if (statusEl) statusEl.textContent = t('uploading');

  const fd = new FormData();
  fd.append('image', file);

  const r = await api('POST', `${BASE}/upload.php`, fd, true);
  if (r.ok && r.data?.url) {
    document.getElementById('f_im').value = r.data.url;
    updateImgPreview();
    if (statusEl) statusEl.textContent = '✓';
    toast(lang === 'ar' ? '✓ تم رفع الصورة' : '✓ Image uploaded', 'ok');
    // Switch back to URL tab to show preview
    setImgTab('url');
  } else {
    if (statusEl) statusEl.textContent = t('uploadFailed');
    toast(r.msg || t('uploadFailed'), 'er');
  }
}

async function saveProduct() {
  const id   = document.getElementById('f_id').value;
  const data = {
    name_ar:        document.getElementById('f_nar').value.trim(),
    name_en:        document.getElementById('f_nen').value.trim(),
    brand:          document.getElementById('f_br').value.trim(),
    origin:         document.getElementById('f_or').value.trim(),
    category:       document.getElementById('f_cat').value,
    price:          parseFloat(document.getElementById('f_pr').value) || 0,
    price_before:   parseFloat(document.getElementById('f_pb').value) || null,
    stock:          parseInt(document.getElementById('f_st').value)  || 0,
    image:          document.getElementById('f_im').value.trim(),
    description_ar: document.getElementById('f_dar').value,
    description_en: document.getElementById('f_den').value,
    is_active:      parseInt(document.getElementById('f_ac').value),
  };

  if (!data.name_ar || !data.name_en || !data.brand || data.price <= 0) {
    toast(lang === 'ar' ? 'الاسم والماركة والسعر مطلوبة' : 'Name, brand and price required', 'er');
    return;
  }

  const url = id ? `${BASE}/products.php?id=${id}` : `${BASE}/products.php`;
  const r   = await api(id ? 'PUT' : 'POST', url, data);

  if (r.ok) {
    cm('pf-modal');
    toast(t('saved'), 'ok');
    await loadProducts();
  } else {
    toast(r.msg || t('error'), 'er');
  }
}

async function deleteProduct(id) {
  if (!confirm(t('deleteConfirm'))) return;
  const r = await api('DELETE', `${BASE}/products.php?id=${id}`);
  if (r.ok) {
    toast(t('deleted'));
    await loadProducts();
  } else {
    toast(r.msg || t('error'), 'er');
  }
}

// ── ORDERS ───────────────────────────────────────────────
async function loadOrders() {
  const el = document.getElementById('orders-table-wrap');
  if (el) el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';

  const r = await api('GET', `${BASE}/orders.php`);
  allOrders = (r.ok && Array.isArray(r.data)) ? r.data : [];
  renderOrdersTable(allOrders);
}

function renderOrdersTable(list) {
  const el = document.getElementById('orders-table-wrap');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">🧾</div><p>${t('noOrders')}</p></div>`;
    return;
  }
  const sts  = ['pending','confirmed','shipped','delivered','cancelled'];
  const scls = { pending:'sp', confirmed:'sc2', shipped:'ss', delivered:'sd', cancelled:'sx' };
  el.innerHTML = `<div class="tw"><table>
    <thead><tr>
      <th>#</th>
      <th>${t('customer_col')}</th>
      <th>${t('total')}</th>
      <th>${t('status')}</th>
      <th>${t('date')}</th>
      <th>${t('update')}</th>
      <th>${t('action')}</th>
    </tr></thead>
    <tbody>${list.map(o => `<tr>
      <td style="color:var(--g);font-weight:700">#${o.id}</td>
      <td>
        <div style="font-weight:500">${escHtml(o.user_name || '—')}</div>
        ${o.email ? `<div style="font-size:10px;color:var(--mu)">${escHtml(o.email)}</div>` : ''}
      </td>
      <td style="color:var(--g);font-weight:700">${Number(o.total).toFixed(0)} <small style="color:var(--mu)">${t('aed')}</small></td>
      <td><span class="ost ${scls[o.status] || 'sp'}">${t(o.status)}</span></td>
      <td style="white-space:nowrap">${fmtDate(o.created_at)}</td>
      <td>
        <select class="st-sel" onchange="updateOrderStatus(${o.id}, this.value)">
          ${sts.map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${t(s)}</option>`).join('')}
        </select>
      </td>
      <td><div class="act-row">
        <button class="btn-sm btn-view" onclick='showOrderDetail(${JSON.stringify(o).replace(/'/g,"&#39;")})'>${t('viewDetails')}</button>
        <button class="btn-sm btn-wa-sm" onclick='waOrder(${JSON.stringify(o).replace(/'/g,"&#39;")})'>📱</button>
      </div></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function filterOrders(q) {
  const ql = q.toLowerCase();
  const filtered = allOrders.filter(o =>
    String(o.id).includes(ql) ||
    (o.user_name || '').toLowerCase().includes(ql) ||
    (o.address   || '').toLowerCase().includes(ql)
  );
  renderOrdersTable(filtered);
}

async function updateOrderStatus(id, status) {
  const r = await api('PUT', `${BASE}/orders.php?id=${id}`, { status });
  if (r.ok) toast(t('statusUpdated'), 'ok');
  else toast(r.msg || t('error'), 'er');
}

function showOrderDetail(o) {
  const scls = { pending:'sp', confirmed:'sc2', shipped:'ss', delivered:'sd', cancelled:'sx' };
  const items = (o.items || []).map(i => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div>
        <div style="font-size:13px">${escHtml(lang === 'ar' ? i.name_ar : i.name_en)}</div>
        <div style="font-size:11px;color:var(--mu)">${t('qty')}: ${i.qty}</div>
      </div>
      <div style="font-size:13px;color:var(--g);font-weight:700">${(i.price * i.qty).toFixed(0)} ${t('aed')}</div>
    </div>`).join('');

  document.getElementById('ord-detail-title').textContent = `${lang === 'ar' ? 'طلب رقم' : 'Order'} #${o.id}`;
  document.getElementById('ord-detail-body').innerHTML = `
    <div style="margin-bottom:12px">
      <span class="ost ${scls[o.status] || 'sp'}">${t(o.status)}</span>
      <span style="font-size:11px;color:var(--mu);margin-${lang==='ar'?'right':'left'}:8px">${fmtDate(o.created_at)}</span>
    </div>
    <div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:10px">
      <div style="font-size:11px;color:var(--mu);margin-bottom:3px">${t('customer_col')}</div>
      <div style="font-weight:600">${escHtml(o.user_name || '—')}</div>
      ${o.email ? `<div style="font-size:12px;color:var(--mu)">${escHtml(o.email)}</div>` : ''}
    </div>
    ${o.address ? `<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:10px">
      <div style="font-size:11px;color:var(--mu);margin-bottom:3px">📍 ${t('address')}</div>
      <div style="font-size:13px">${escHtml(o.address)}</div>
    </div>` : ''}
    ${o.notes ? `<div style="background:var(--d3);border-radius:var(--r);padding:12px;margin-bottom:10px">
      <div style="font-size:11px;color:var(--mu);margin-bottom:3px">📝 ${t('notes')}</div>
      <div style="font-size:13px">${escHtml(o.notes)}</div>
    </div>` : ''}
    <div style="margin-bottom:10px">${items}</div>
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid rgba(201,168,76,.2)">
      <span style="font-size:15px;font-weight:700;color:var(--g)">${t('total')}</span>
      <span style="font-size:17px;font-weight:800;color:var(--g)">${Number(o.total).toFixed(2)} ${t('aed')}</span>
    </div>`;
  document.getElementById('ord-detail-modal').classList.add('open');
}

function waOrder(o) {
  const items = (o.items || []).map(i =>
    `🫙 ${lang === 'ar' ? i.name_ar : i.name_en} × ${i.qty} = ${(i.price * i.qty).toFixed(0)} ${t('aed')}`
  ).join('\n');
  const msg = `*${lang === 'ar' ? 'طلب رقم' : 'Order'} #${o.id}*\n\n${items}\n\n💰 ${t('total')}: ${Number(o.total).toFixed(0)} ${t('aed')}\n👤 ${o.user_name || ''}\n📍 ${o.address || ''}`;
  window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── USERS ────────────────────────────────────────────────
async function loadUsers() {
  const el = document.getElementById('users-table-wrap');
  if (el) el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';

  const r = await api('GET', `${BASE}/users.php`);
  allUsers = (r.ok && Array.isArray(r.data)) ? r.data : [];
  renderUsersTable(allUsers);
}

function renderUsersTable(list) {
  const el = document.getElementById('users-table-wrap');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">👥</div><p>${t('noUsers')}</p></div>`;
    return;
  }
  el.innerHTML = `<div class="tw"><table>
    <thead><tr>
      <th>#</th>
      <th>${t('name')}</th>
      <th>${t('email')}</th>
      <th>${t('role')}</th>
      <th>${t('joined')}</th>
    </tr></thead>
    <tbody>${list.map(u => `<tr>
      <td style="color:var(--mu)">${u.id}</td>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'var(--g)':'var(--d3)'};color:${u.role==='admin'?'var(--d)':'var(--mu)'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">
            ${escHtml((u.name || '?')[0].toUpperCase())}
          </div>
          <span style="font-weight:${u.role==='admin'?'700':'400'}">${escHtml(u.name)}</span>
        </div>
      </td>
      <td style="color:var(--mu)">${escHtml(u.email)}</td>
      <td><span class="${u.role==='admin'?'badge-on':''}">
        ${u.role==='admin'?'⚙️ '+t('admin'):'👤 '+t('customer')}
      </span></td>
      <td>${fmtDate(u.created_at)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function filterUsers(q) {
  const ql = q.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(ql) ||
    u.email.toLowerCase().includes(ql)
  );
  renderUsersTable(filtered);
}

// ── PAYMENTS SCHEDULE ────────────────────────────────────
async function loadPayments() {
  const el = document.getElementById('payments-body');
  if (!el) return;

  // Ensure orders are loaded
  if (!allOrders.length) {
    const r = await api('GET', `${BASE}/orders.php`);
    allOrders = (r.ok && Array.isArray(r.data)) ? r.data : [];
  }

  // For now, all orders are COD. Future: some may be scheduled.
  const scls = { pending:'sp', confirmed:'sc2', shipped:'ss', delivered:'sd', cancelled:'sx' };

  const rows = allOrders.map(o => {
    // Determine payment method — currently all COD
    const payMethod = o.payment_method || 'cod';
    const payStatus = o.status === 'delivered' ? 'paid'
                    : o.status === 'cancelled'  ? 'cancelled'
                    : 'pending';
    return { ...o, payMethod, payStatus };
  });

  el.innerHTML = `
    <div style="background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.2);border-radius:var(--r);padding:12px 14px;margin-bottom:16px;font-size:13px;color:var(--mu)">
      ℹ️ ${t('payNotes')}
    </div>
    <div class="tw"><table>
      <thead><tr>
        <th>#</th>
        <th>${t('customer_col')}</th>
        <th>${t('total')}</th>
        <th>${t('paymentMethod')}</th>
        <th>${t('paymentStatus')}</th>
        <th>${t('scheduledDate')}</th>
        <th>${t('status')}</th>
        <th>${t('date')}</th>
      </tr></thead>
      <tbody>${rows.map(o => `<tr>
        <td style="color:var(--g);font-weight:700">#${o.id}</td>
        <td style="font-weight:500">${escHtml(o.user_name || '—')}</td>
        <td style="color:var(--g);font-weight:700">${Number(o.total).toFixed(0)} <small style="color:var(--mu)">${t('aed')}</small></td>
        <td><span class="pay-badge-cod">${t('cod')}</span></td>
        <td><span class="${o.payStatus==='paid'?'pay-badge-paid':o.payStatus==='cancelled'?'badge-off':'pay-badge-cod'}">
          ${o.payStatus==='paid'?t('paid'):o.payStatus==='cancelled'?t('cancelled'):t('pending')}
        </span></td>
        <td style="color:var(--mu);font-size:11px">${lang==='ar'?'—  (قريباً)':'— (soon)'}</td>
        <td><span class="ost ${scls[o.status]||'sp'}">${t(o.status)}</span></td>
        <td style="white-space:nowrap">${fmtDate(o.created_at)}</td>
      </tr>`).join('')}
      ${!rows.length ? `<tr><td colspan="8"><div class="empty-state"><div class="ei">💳</div><p>${t('noOrders')}</p></div></td></tr>` : ''}
      </tbody>
    </table></div>`;
}

// ── INIT ─────────────────────────────────────────────────
function initAdmin() {
  loadAuth();

  // Show user info
  if (currentUser) {
    const el = document.getElementById('adm-user-name');
    if (el) el.textContent = currentUser.name;
    const el2 = document.getElementById('adm-user-email');
    if (el2) el2.textContent = currentUser.email;
  }

  if (!isAdmin()) {
    document.getElementById('adm-content').innerHTML = `
      <div class="access-denied">
        <div class="ei">🔒</div>
        <h3>${t('adminOnly')}</h3>
        <p>${t('loginFirst')}</p>
        <a href="../index.html" class="btn-primary" style="margin-top:16px;display:inline-flex">${t('goToStore')}</a>
      </div>`;
    return;
  }

  initSidebar();

  // Close modals on overlay click
  document.querySelectorAll('.ov').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });

  // Start on dashboard
  switchSection('dashboard');
}

document.addEventListener('DOMContentLoaded', initAdmin);
