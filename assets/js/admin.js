// ═══════════════════════════════════════════════════════
// TORO Admin Panel — admin.js
// ═══════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────────
const BASE   = 'https://qooqz.infinityfreeapp.com/api';
const WA_NUM = '971505931141';

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
// Source of truth: assets/lang/admin-ar.json / admin-en.json
// Inline copies below serve as immediate synchronous fallback.
let i18n = {
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
    cod: 'الدفع عند الاستلام', scheduledPayment: 'دفع مجدول', paid: 'مدفوع', failed: 'فشل', refunded: 'مُسترد',
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
    // Stock movements
    stockMovements: 'حركة المخزون', addStock: 'إضافة حركة مخزون',
    stockHistory: 'سجل حركات المخزون', movementType: 'نوع الحركة',
    stockIn: 'إضافة مخزون', stockOut: 'سحب مخزون', adjustment: 'تسوية مخزون',
    balanceAfter: 'الرصيد بعد', reason: 'السبب', quantity: 'الكمية',
    selectProduct: 'اختر المنتج', noMovements: 'لا توجد حركات مخزون',
    stockUpdated: '✓ تم تحديث المخزون',
    // Sales reports
    salesReports: 'تقارير المبيعات', selectPeriod: 'الفترة الزمنية',
    last7days: 'آخر 7 أيام', last30days: 'آخر 30 يوم',
    last3months: 'آخر 3 أشهر', lastYear: 'السنة الكاملة',
    revenueChart: 'مخطط الإيرادات', topProducts: 'أكثر المنتجات مبيعاً',
    ordersByStatus: 'الطلبات حسب الحالة', avgOrderValue: 'متوسط قيمة الطلب',
    totalSold: 'وحدة مباعة',
    // User activation
    activateUser: 'تفعيل', deactivateUser: 'تعطيل',
    userActivated: '✓ تم تفعيل الحساب', userDeactivated: '✓ تم تعطيل الحساب',
    inactive: 'غير نشط', confirmDeactivate: 'تعطيل هذا الحساب؟',
    // HTML page labels
    navHome: 'الرئيسية', navStore: 'إدارة المتجر', navReports: 'التقارير', navUsers: 'إدارة المستخدمين',
    dashboardSub: 'نظرة عامة على المتجر', revenueStat: 'الإيراد (د.إ)',
    aedFull: 'درهم إماراتي', revenueTarget: 'من هدف 100,000 د.إ',
    pendingWaiting: 'طلب بانتظار المعالجة', viewOrders: 'عرض الطلبات ←',
    viewAll: 'عرض الكل', productsList: 'قائمة المنتجات',
    productsSub: 'إضافة وتعديل وحذف المنتجات', ordersSub: 'متابعة وتحديث حالة الطلبات',
    ordersList: 'قائمة الطلبات', paymentsSub: 'متابعة مدفوعات الطلبات',
    paymentsHistory: 'سجل المدفوعات', usersSub: 'قائمة المستخدمين المسجلين وإدارة الحسابات',
    customersList: 'قائمة العملاء', stockSub: 'إضافة وسحب المخزون ومتابعة الحركات',
    recordMovement: 'تسجيل الحركة', stockReasonPh: 'مثال: شحنة جديدة، طلب رقم 25...',
    reportsSub: 'إحصائيات ومخططات بيانية لمبيعات المتجر',
    refresh: '🔄 تحديث', cancel: 'إلغاء', preview: 'معاينة',
    urlTab: '🔗 رابط URL', storeLink: 'المتجر',
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
    cod: 'Cash on Delivery', scheduledPayment: 'Scheduled Payment', paid: 'Paid', failed: 'Failed', refunded: 'Refunded',
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
    // Stock movements
    stockMovements: 'Stock Movements', addStock: 'Add Stock Movement',
    stockHistory: 'Stock Movement History', movementType: 'Movement Type',
    stockIn: 'Stock In', stockOut: 'Stock Out', adjustment: 'Adjustment',
    balanceAfter: 'Balance After', reason: 'Reason', quantity: 'Quantity',
    selectProduct: 'Select Product', noMovements: 'No stock movements',
    stockUpdated: '✓ Stock updated',
    // Sales reports
    salesReports: 'Sales Reports', selectPeriod: 'Time Period',
    last7days: 'Last 7 Days', last30days: 'Last 30 Days',
    last3months: 'Last 3 Months', lastYear: 'Full Year',
    revenueChart: 'Revenue Chart', topProducts: 'Top Selling Products',
    ordersByStatus: 'Orders by Status', avgOrderValue: 'Avg Order Value',
    totalSold: 'units sold',
    // User activation
    activateUser: 'Activate', deactivateUser: 'Deactivate',
    userActivated: '✓ User activated', userDeactivated: '✓ User deactivated',
    inactive: 'Inactive', confirmDeactivate: 'Deactivate this account?',
    // HTML page labels
    navHome: 'Home', navStore: 'Store Management', navReports: 'Reports', navUsers: 'User Management',
    dashboardSub: 'Store overview', revenueStat: 'Revenue (AED)',
    aedFull: 'UAE Dirham', revenueTarget: 'of 100,000 AED target',
    pendingWaiting: 'order(s) awaiting processing', viewOrders: 'View Orders →',
    viewAll: 'View All', productsList: 'Products List',
    productsSub: 'Add, edit and delete products', ordersSub: 'Track and update order status',
    ordersList: 'Orders List', paymentsSub: 'Track order payments',
    paymentsHistory: 'Payment Records', usersSub: 'Registered users and account management',
    customersList: 'Customers List', stockSub: 'Add, withdraw and track inventory',
    recordMovement: 'Record Movement', stockReasonPh: 'e.g. New shipment, Order #25...',
    reportsSub: 'Store sales statistics and charts',
    refresh: '🔄 Refresh', cancel: 'Cancel', preview: 'Preview',
    urlTab: '🔗 URL Link', storeLink: 'Store',
  }
};

function t(k) { return (i18n[lang] || i18n.ar)[k] || k; }

// ── JSON LANG LOADER ─────────────────────────────────────
// Async: loads admin-ar.json / admin-en.json and merges into i18n.
// Keeps inline fallback above so first render is always populated.
async function loadAdminLang() {
  try {
    const base = '../assets/lang/';
    const [arRes, enRes] = await Promise.all([
      fetch(base + 'admin-ar.json'),
      fetch(base + 'admin-en.json')
    ]);
    if (arRes.ok) Object.assign(i18n.ar, await arRes.json());
    if (enRes.ok) Object.assign(i18n.en, await enRes.json());
  } catch (e) { /* network failure — inline fallback stays */ }
}

// ── LANGUAGE SWITCH ──────────────────────────────────────
function applyTranslations() {
  const d = document.documentElement;
  d.lang = lang;
  d.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dataset.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'AR';
}

function setLang(l) {
  lang = l;
  localStorage.setItem(LS.LANG, l);
  applyTranslations();
  if (!isAdmin()) {
    const el = document.getElementById('adm-content');
    if (el) el.innerHTML = `
      <div class="access-denied">
        <div class="ei">🔒</div>
        <h3>${t('adminOnly')}</h3>
        <p>${t('loginFirst')}</p>
        <a href="/" class="btn-primary" style="margin-top:16px;display:inline-flex">${t('goToStore')}</a>
      </div>`;
  } else {
    switchSection(currentSection);
  }
}

function toggleLang() { setLang(lang === 'ar' ? 'en' : 'ar'); }

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

  // InfinityFree sometimes strips custom request headers on GET/DELETE.
  // db.php has a $_GET['_token'] fallback — use it so auth always works.
  if (tk && (method === 'GET' || method === 'DELETE') && !url.match(/[?&]_token=/)) {
    url += (url.includes('?') ? '&' : '?') + '_token=' + encodeURIComponent(tk);
  }

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
  // Redirect to root (served by index.php via DirectoryIndex)
  window.location.href = '/';
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
  else if (section === 'stock')     loadStockMovements();
  else if (section === 'reports')   loadReports();
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
      <th class="col-hide-m">${t('brand')}</th>
      <th class="col-hide-m">${t('category')}</th>
      <th class="col-hide-m">${t('before')}</th>
      <th>${t('after')}</th>
      <th class="col-hide-m">${t('disc')}</th>
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
        <td class="col-hide-m" style="font-weight:500">${escHtml(p.brand)}</td>
        <td class="col-hide-m"><span class="${scls[p.category] || 'cat-u'}">${catLbl}</span></td>
        <td class="col-hide-m">${p.price_before ? `<span style="text-decoration:line-through;color:var(--mu)">${p.price_before}</span>` : '—'}</td>
        <td style="color:var(--g);font-weight:700">${p.price} <small style="color:var(--mu)">${t('aed')}</small></td>
        <td class="col-hide-m">${disc ? `<span style="color:var(--re);font-weight:700">-${disc}%</span>` : '—'}</td>
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
  document.getElementById('f_ac').value    = (p?.is_active === 0 || p?.is_active === '0') ? '0' : '1';
  document.getElementById('f_dar').value   = p?.description_ar || '';
  document.getElementById('f_den').value   = p?.description_en || '';
  // Populate up to 3 image slots from images_arr (or fallback to legacy image field)
  const imgs = p?.images_arr?.length ? p.images_arr : (p?.image ? [p.image] : []);
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`f_im_${i}`);
    if (el) el.value = imgs[i-1] || '';
    updateImgPreview(i);
    setImgTab('url', i);
  }
  document.getElementById('pf-modal').classList.add('open');
}

function updateImgPreview(slot) {
  const n   = slot || 1;
  const url = document.getElementById(`f_im_${n}`)?.value?.trim();
  const el  = document.getElementById(`imgPrev${n}`);
  if (!el) return;
  el.innerHTML = url
    ? `<img src="${escHtml(url)}" onerror="this.parentElement.innerHTML='<span style=\'color:var(--re)\'>رابط غير صحيح / Invalid URL</span>'">`
    : `<span>${lang === 'ar' ? 'معاينة' : 'Preview'}</span>`;
}

function setImgTab(tab, slot) {
  const n = slot || 1;
  const input = document.getElementById(`f_im_${n}`);
  if (!input) return;
  const slotBody = input.closest('.img-slot-body');
  if (!slotBody) return;
  slotBody.querySelectorAll('.img-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  const urlSec  = document.getElementById(`img-url-section-${n}`);
  const fileSec = document.getElementById(`img-file-section-${n}`);
  if (urlSec)  urlSec.style.display  = tab === 'url'    ? '' : 'none';
  if (fileSec) fileSec.style.display = tab === 'upload' ? '' : 'none';
}

async function handleFileUpload(input, slot) {
  const n    = slot || 1;
  const file = input.files[0];
  if (!file) return;

  const dropZone = document.getElementById(`img-drop-zone-${n}`);
  const statusEl = document.getElementById(`upload-status-${n}`);
  if (statusEl) statusEl.textContent = t('uploading');

  const fd = new FormData();
  fd.append('image', file);

  const r = await api('POST', `${BASE}/upload.php`, fd, true);
  if (r.ok && r.data?.url) {
    document.getElementById(`f_im_${n}`).value = r.data.url;
    updateImgPreview(n);
    if (statusEl) statusEl.textContent = '✓';
    toast(lang === 'ar' ? '✓ تم رفع الصورة' : '✓ Image uploaded', 'ok');
    // Switch back to URL tab to show preview
    setImgTab('url', n);
  } else {
    if (statusEl) statusEl.textContent = t('uploadFailed');
    toast(r.msg || t('uploadFailed'), 'er');
  }
}

async function clearImg(slot) {
  const n   = slot || 1;
  const inp = document.getElementById(`f_im_${n}`);
  const url = inp ? inp.value.trim() : '';

  // If the URL points to our own uploads directory, delete it from the server
  if (url && url.includes('/uploads/')) {
    const r = await api('DELETE', `${BASE}/upload.php`, { url });
    if (!r.ok) {
      toast(r.msg || (lang === 'ar' ? 'فشل حذف الصورة' : 'Failed to delete image'), 'er');
      return;
    }
  }

  if (inp) inp.value = '';
  const prevEl = document.getElementById(`imgPrev${n}`);
  if (prevEl) prevEl.innerHTML = `<span data-i18n="preview">${t('preview')}</span>`;
  const statusEl = document.getElementById(`upload-status-${n}`);
  if (statusEl) statusEl.textContent = '';
  toast(lang === 'ar' ? '🗑 تم حذف الصورة' : '🗑 Image removed', 'ok');
}

async function saveProduct() {
  const id   = document.getElementById('f_id').value;
  // Collect up to 3 images
  const imagesArr = [];
  for (let i = 1; i <= 3; i++) {
    const v = (document.getElementById(`f_im_${i}`)?.value || '').trim();
    if (v) imagesArr.push(v);
  }
  const data = {
    name_ar:        document.getElementById('f_nar').value.trim(),
    name_en:        document.getElementById('f_nen').value.trim(),
    brand:          document.getElementById('f_br').value.trim(),
    origin:         document.getElementById('f_or').value.trim(),
    category:       document.getElementById('f_cat').value,
    price:          parseFloat(document.getElementById('f_pr').value) || 0,
    price_before:   parseFloat(document.getElementById('f_pb').value) || null,
    stock:          parseInt(document.getElementById('f_st').value)  || 0,
    image:          imagesArr[0] || '',
    images_arr:     imagesArr,
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
      <th class="col-hide-m">${t('date')}</th>
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
      <td class="col-hide-m" style="white-space:nowrap">${fmtDate(o.created_at)}</td>
      <td>
        <select class="st-sel" onchange="updateOrderStatus(${o.id}, this.value)">
          ${sts.map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${t(s)}</option>`).join('')}
        </select>
      </td>
      <td><div class="act-row">
        <button class="btn-sm btn-view" onclick='showOrderDetail(${JSON.stringify(o).replace(/'/g,"&#39;")})'>${t('viewDetails')}</button>
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
    `🫙 *${lang === 'ar' ? i.name_ar : i.name_en}* × ${i.qty} — ${(i.price * i.qty).toFixed(0)} ${t('aed')}`
  ).join('\n');
  const msg = lang === 'ar'
    ? `✨ *متجر TORO للعطور*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📋 *طلب رقم #${o.id}*\n\n` +
      `${items}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 *الإجمالي: ${Number(o.total).toFixed(2)} ${t('aed')}*\n` +
      `👤 العميل: ${o.user_name || '—'}\n` +
      `📍 العنوان: ${o.address || '—'}\n` +
      `💳 الدفع عند الاستلام`
    : `✨ *TORO Perfume Store*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Order #${o.id}*\n\n` +
      `${items}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total: ${Number(o.total).toFixed(2)} ${t('aed')}*\n` +
      `👤 Customer: ${o.user_name || '—'}\n` +
      `📍 Address: ${o.address || '—'}\n` +
      `💳 Cash on Delivery`;
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
      <th class="col-hide-m">${t('status')}</th>
      <th class="col-hide-m">${t('joined')}</th>
      <th>${t('action')}</th>
    </tr></thead>
    <tbody>${list.map(u => {
      const isActive = u.is_active == null ? null : (u.is_active == 1);
      // null means column missing from DB response — treat as active but don't show toggle
      const activeKnown = u.is_active != null;
      const displayActive = isActive !== false; // true or unknown → show as active
      return `<tr>
        <td style="color:var(--mu)">${u.id}</td>
        <td>
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'var(--g)':'var(--d3)'};color:${u.role==='admin'?'var(--d)':'var(--mu)'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;opacity:${displayActive?1:.5}">
              ${escHtml((u.name || '?')[0].toUpperCase())}
            </div>
            <span style="font-weight:${u.role==='admin'?'700':'400'};opacity:${displayActive?1:.6}">${escHtml(u.name)}</span>
          </div>
        </td>
        <td style="color:var(--mu)">${escHtml(u.email)}</td>
        <td><span class="${u.role==='admin'?'badge-on':''}">
          ${u.role==='admin'?'⚙️ '+t('admin'):'👤 '+t('customer')}
        </span></td>
        <td class="col-hide-m"><span class="${displayActive?'badge-on':'badge-off'}">${displayActive?t('active'):t('inactive')}</span></td>
        <td class="col-hide-m">${fmtDate(u.created_at)}</td>
        <td>
          ${(u.role !== 'admin' && activeKnown)
            ? `<button class="btn-sm ${displayActive?'btn-del':'btn-edit'}" onclick="toggleUserActive(${u.id}, ${displayActive?0:1})">
                ${displayActive ? t('deactivateUser') : t('activateUser')}
               </button>`
            : `<span style="color:var(--mu);font-size:11px">${u.role==='admin'?t('admin'):'—'}</span>`}
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

async function toggleUserActive(userId, newActive) {
  if (newActive === 0 && !confirm(t('confirmDeactivate'))) return;
  const r = await api('PUT', `${BASE}/users.php?id=${userId}`, { is_active: newActive });
  if (r.ok) {
    toast(newActive ? t('userActivated') : t('userDeactivated'), 'ok');
    await loadUsers();
  } else {
    toast(r.msg || t('error'), 'er');
  }
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
  el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';

  const r = await api('GET', `${BASE}/payments.php`);
  const payments = (r.ok && Array.isArray(r.data)) ? r.data : [];

  const methodLabel = { cod:'💵 '+t('cod'), card:'💳 Card', bank_transfer:'🏦 Bank', scheduled:'📅 '+t('scheduledPayment') };
  const payScls     = { pending:'pay-badge-cod', paid:'pay-badge-paid', failed:'badge-off', refunded:'badge-off' };
  const orderScls   = { pending:'sp', confirmed:'sc2', shipped:'ss', delivered:'sd', cancelled:'sx' };

  el.innerHTML = `
    <div style="background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.2);border-radius:var(--r);padding:12px 14px;margin-bottom:16px;font-size:13px;color:var(--mu)">
      ℹ️ ${t('payNotes')}
    </div>
    <div class="tw"><table>
      <thead><tr>
        <th>#</th>
        <th>${t('customer_col')}</th>
        <th>${t('total')}</th>
        <th class="col-hide-m">${t('paymentMethod')}</th>
        <th>${t('paymentStatus')}</th>
        <th class="col-hide-m">${t('scheduledDate')}</th>
        <th>${t('status')}</th>
        <th class="col-hide-m">${t('date')}</th>
        <th>${t('action')}</th>
      </tr></thead>
      <tbody>${payments.length ? payments.map(p => `<tr>
        <td style="color:var(--g);font-weight:700">#${p.order_id}</td>
        <td style="font-weight:500">${escHtml(p.user_name || '—')}</td>
        <td style="color:var(--g);font-weight:700">${Number(p.amount).toFixed(0)} <small style="color:var(--mu)">${t('aed')}</small></td>
        <td class="col-hide-m"><span class="pay-badge-cod">${methodLabel[p.method] || p.method}</span></td>
        <td>
          <select class="st-sel" onchange="updatePaymentStatus(${p.id}, this.value)">
            ${['pending','paid','failed','refunded'].map(s=>`<option value="${s}"${p.status===s?' selected':''}>${t(s)||s}</option>`).join('')}
          </select>
        </td>
        <td class="col-hide-m" style="color:var(--mu);font-size:11px">${p.scheduled_date || (lang==='ar'?'—':'—')}</td>
        <td><span class="ost ${orderScls[p.order_status]||'sp'}">${t(p.order_status)||p.order_status}</span></td>
        <td class="col-hide-m" style="white-space:nowrap">${fmtDate(p.created_at)}</td>
        <td><button class="btn-sm btn-view" onclick="showPaymentDetail(${p.id})">${t('viewDetails')}</button></td>
      </tr>`).join('') : `<tr><td colspan="9"><div class="empty-state"><div class="ei">💳</div><p>${t('noOrders')}</p></div></td></tr>`}
      </tbody>
    </table></div>`;

  // Store payments data for detail view
  window._payments = payments;
}

async function updatePaymentStatus(payId, status) {
  const r = await api('PUT', `${BASE}/payments.php?id=${payId}`, { status });
  if (r.ok) toast(t('statusUpdated'), 'ok');
  else toast(r.msg || t('error'), 'er');
}

function showPaymentDetail(payId) {
  const p = (window._payments || []).find(x => x.id == payId);
  if (!p) return;
  const payScls = { pending:'pay-badge-cod', paid:'pay-badge-paid', failed:'badge-off', refunded:'badge-off' };
  alert(`#${p.order_id} | ${p.user_name} | ${Number(p.amount).toFixed(2)} ${t('aed')} | ${p.status}`);
}


// ── STOCK MOVEMENTS ──────────────────────────────────────
let allMovements = [];

async function loadStockMovements() {
  const bodyEl = document.getElementById('stock-body');
  const tableEl = document.getElementById('stock-table-wrap');
  const sel = document.getElementById('sm-product');
  if (bodyEl)  bodyEl.innerHTML  = '';
  if (tableEl) tableEl.innerHTML = '<div class="ldw"><div class="ld"></div></div>';
  if (sel)     sel.innerHTML     = `<option value="">${lang === 'ar' ? '... جاري التحميل' : 'Loading...'}</option>`;

  // Always fetch fresh: stock movements + ALL products (including inactive) for admin selector
  const [mr, pr] = await Promise.all([
    api('GET', `${BASE}/stock.php`),
    api('GET', `${BASE}/products.php?admin=1`)
  ]);

  if (pr.ok && Array.isArray(pr.data)) allProducts = pr.data;
  allMovements = (mr.ok && Array.isArray(mr.data)) ? mr.data : [];

  // Populate product select
  if (sel) {
    if (allProducts.length) {
      sel.innerHTML = `<option value="">${t('selectProduct')}</option>` +
        allProducts.map(p => {
          const lbl = escHtml(lang === 'ar' ? p.name_ar : p.name_en);
          const suffix = p.is_active === 1 ? '' : ` (${lang === 'ar' ? 'مخفي' : 'hidden'})`;
          return `<option value="${p.id}">${lbl}${suffix} — ${t('stock')}: ${p.stock ?? 0}</option>`;
        }).join('');
    } else {
      sel.innerHTML = `<option value="">${lang === 'ar' ? '— فشل تحميل المنتجات، حاول مجدداً —' : '— Failed to load products, retry —'}</option>`;
    }
  }

  renderMovementsTable(allMovements);
}

function renderMovementsTable(list) {
  const el = document.getElementById('stock-table-wrap');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">📦</div><p>${t('noMovements')}</p></div>`;
    return;
  }
  const typeLabel = { in: `<span class="badge-on">⬆ ${t('stockIn')}</span>`, out: `<span class="badge-off">⬇ ${t('stockOut')}</span>`, adjustment: `<span style="color:var(--or)">⚙ ${t('adjustment')}</span>` };
  el.innerHTML = `<div class="tw"><table>
    <thead><tr>
      <th class="col-hide-m">#</th>
      <th>${t('product')}</th>
      <th>${t('movementType')}</th>
      <th>${t('quantity')}</th>
      <th>${t('balanceAfter')}</th>
      <th class="col-hide-m">${t('reason')}</th>
      <th class="col-hide-m">${t('name')}</th>
      <th class="col-hide-m">${t('date')}</th>
    </tr></thead>
    <tbody>${list.map(m => `<tr>
      <td class="col-hide-m" style="color:var(--mu)">${m.id}</td>
      <td>
        <div style="font-weight:500">${escHtml(lang==='ar'?m.name_ar:m.name_en)}</div>
        <div style="font-size:10px;color:var(--mu)">${escHtml(m.brand)}</div>
      </td>
      <td>${typeLabel[m.type] || m.type}</td>
      <td style="font-weight:700;color:${m.type==='in'?'var(--gr)':m.type==='out'?'var(--re)':'var(--or)'}">${m.type==='in'?'+':m.type==='out'?'-':''}${m.quantity}</td>
      <td style="font-weight:700;color:var(--g)">${m.balance}</td>
      <td class="col-hide-m" style="color:var(--mu);font-size:12px">${escHtml(m.reason||'—')}</td>
      <td class="col-hide-m" style="color:var(--mu)">${escHtml(m.admin_name||'—')}</td>
      <td class="col-hide-m" style="white-space:nowrap">${fmtDate(m.created_at)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

async function addStockMovement() {
  const productId = document.getElementById('sm-product')?.value;
  const type      = document.getElementById('sm-type')?.value;
  const qty       = parseInt(document.getElementById('sm-qty')?.value);
  const reason    = document.getElementById('sm-reason')?.value?.trim();

  if (!productId) { toast(t('selectProduct'), 'er'); return; }
  if (!qty || qty <= 0) { toast(lang==='ar'?'أدخل كمية أكبر من صفر':'Enter a quantity greater than 0', 'er'); return; }

  const r = await api('POST', `${BASE}/stock.php`, { product_id: parseInt(productId), type, quantity: qty, reason });
  if (r.ok) {
    toast(t('stockUpdated'), 'ok');
    // Update product stock in allProducts; reload full list if not found
    const idx = allProducts.findIndex(p => p.id == productId);
    if (idx >= 0) {
      allProducts[idx].stock = r.data.new_stock;
    } else {
      // Product not in cache — force a full reload
      const pr = await api('GET', `${BASE}/products.php`);
      if (pr.ok && Array.isArray(pr.data)) allProducts = pr.data;
    }
    // Reset form
    document.getElementById('sm-qty').value = '';
    document.getElementById('sm-reason').value = '';
    await loadStockMovements();
  } else {
    toast(r.msg || t('error'), 'er');
  }
}

// ── SALES REPORTS ────────────────────────────────────────

async function loadReports() {
  const period = document.getElementById('rpt-period')?.value || '30days';
  const el = document.getElementById('rpt-body');
  if (el) el.innerHTML = '<div class="ldw"><div class="ld"></div></div>';

  const r = await api('GET', `${BASE}/reports.php?period=${period}`);
  if (!r.ok) {
    const errMsg = `<div class="empty-state" style="padding:32px 0"><div class="ei">📊</div><p>${r.msg || t('error')}</p></div>`;
    if (el)  el.innerHTML  = errMsg;
    const smEl = document.getElementById('rpt-summary');
    if (smEl) smEl.innerHTML = errMsg;
    const rcEl = document.getElementById('revenue-chart-wrap');
    if (rcEl) rcEl.innerHTML = errMsg;
    const tpEl = document.getElementById('rpt-top-products');
    if (tpEl) tpEl.innerHTML = errMsg;
    const scEl = document.getElementById('status-chart-wrap');
    if (scEl) scEl.innerHTML = errMsg;
    return;
  }

  if (el) el.innerHTML = '';

  const d = r.data;

  // Summary cards
  const smEl = document.getElementById('rpt-summary');
  if (smEl) {
    smEl.innerHTML = `
      <div class="stat-card" style="flex:1;min-width:120px">
        <div class="stat-icon">🧾</div>
        <div class="stat-val">${fmtNum(d.summary?.total_orders||0)}</div>
        <div class="stat-lbl">${t('totalOrders')}</div>
      </div>
      <div class="stat-card green" style="flex:1;min-width:120px">
        <div class="stat-icon">💰</div>
        <div class="stat-val">${fmtNum(Math.round(d.summary?.total_revenue||0))}</div>
        <div class="stat-lbl">${t('totalRevenue')} (${t('aed')})</div>
      </div>
      <div class="stat-card blue" style="flex:1;min-width:120px">
        <div class="stat-icon">📊</div>
        <div class="stat-val">${fmtNum(Math.round(d.summary?.avg_order_value||0))}</div>
        <div class="stat-lbl">${t('avgOrderValue')} (${t('aed')})</div>
      </div>`;
  }

  // Revenue chart
  renderRevenueChart(d.revenue || []);

  // Top products
  renderTopProducts(d.top_products || []);

  // Status chart
  renderStatusChart(d.by_status || []);
}

// ── Revenue chart: pure SVG, no external deps ───────────
function renderRevenueChart(data) {
  const el = document.getElementById('revenue-chart-wrap');
  if (!el) return;
  if (!data.length) {
    el.innerHTML = `<div class="empty-state" style="padding:40px 0"><div class="ei">📊</div><p>${lang==='ar'?'لا توجد بيانات للفترة المحددة':'No data for selected period'}</p></div>`;
    return;
  }

  const width = 700, height = 220;
  const padLeft = 52, padRight = 12, padTop = 16, padBottom = 48;
  const chartWidth  = width  - padLeft - padRight;
  const chartHeight = height - padTop  - padBottom;

  const revenues = data.map(d => parseFloat(d.revenue));
  const counts   = data.map(d => parseInt(d.orders_count || 0));
  const maxRev   = Math.max(...revenues, 1);
  const maxCnt   = Math.max(...counts, 1);
  const n        = data.length;
  const slotW    = chartWidth / Math.max(n, 1);
  const barW     = Math.max(4, slotW * 0.65);

  // Grid lines & Y labels
  const steps = 4;
  let grid = '';
  for (let i = 0; i <= steps; i++) {
    const y   = padTop + chartHeight - (chartHeight * i / steps);
    const val = (maxRev * i / steps);
    const lbl = val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(0);
    grid += `<line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - padRight}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`;
    grid += `<text x="${padLeft - 4}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#666" font-size="9">${lbl}</text>`;
  }

  // Bars + count dots
  let bars = '', dots = '', xLabels = '';
  const pts = [];
  for (let i = 0; i < n; i++) {
    const barHeight = Math.max(2, (revenues[i] / maxRev) * chartHeight);
    const cx = padLeft + i * slotW + slotW / 2;
    const bx = cx - barW / 2;
    const by = padTop + chartHeight - barHeight;
    const dotY = padTop + chartHeight - (counts[i] / maxCnt) * chartHeight;

    bars += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${barHeight.toFixed(1)}" fill="rgba(201,168,76,.75)" rx="2">` +
            `<title>${data[i].period}: ${revenues[i].toFixed(0)} ${lang==='ar'?'د.إ':'AED'} / ${counts[i]} ${lang==='ar'?'طلب':'orders'}</title></rect>`;

    pts.push(`${cx.toFixed(1)},${dotY.toFixed(1)}`);
    dots += `<circle cx="${cx.toFixed(1)}" cy="${dotY.toFixed(1)}" r="3" fill="#4ca3c9"><title>${counts[i]} ${lang==='ar'?'طلب':'orders'}</title></circle>`;

    const lbl = data[i].period?.slice(-5) || '';
    xLabels += `<text x="${cx.toFixed(1)}" y="${height - 2}" text-anchor="middle" fill="#666" font-size="8" transform="rotate(-30,${cx.toFixed(1)},${height - 2})">${lbl}</text>`;
  }
  const polyline = pts.length > 1
    ? `<polyline points="${pts.join(' ')}" fill="none" stroke="#4ca3c9" stroke-width="1.5" stroke-linejoin="round"/>`
    : '';

  // Legend
  const legendX = padLeft;
  const leg = `<rect x="${legendX}" y="4" width="10" height="10" fill="rgba(201,168,76,.75)" rx="1"/>` +
              `<text x="${legendX + 14}" y="13" fill="#999" font-size="9">${lang==='ar'?'الإيراد':'Revenue'}</text>` +
              `<circle cx="${legendX + 80}" cy="9" r="3" fill="#4ca3c9"/>` +
              `<text x="${legendX + 87}" y="13" fill="#999" font-size="9">${lang==='ar'?'الطلبات':'Orders'}</text>`;

  el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;display:block;max-height:220px" xmlns="http://www.w3.org/2000/svg">
    ${grid}
    <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + chartHeight}" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
    <line x1="${padLeft}" y1="${padTop + chartHeight}" x2="${width - padRight}" y2="${padTop + chartHeight}" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
    ${bars}${polyline}${dots}${xLabels}${leg}
  </svg>`;
}

function renderTopProducts(data) {
  const el = document.getElementById('rpt-top-products');
  if (!el) return;
  if (!data.length) { el.innerHTML = `<div class="empty-state" style="padding:20px"><p>${t('noProducts')}</p></div>`; return; }
  const maxSold = Math.max(...data.map(p => parseInt(p.total_sold || 0)), 1);
  el.innerHTML = `<div style="padding:12px">${data.map((p, i) => {
    const sold = parseInt(p.total_sold || 0);
    const pct  = Math.round(sold / maxSold * 100);
    const nm   = escHtml(lang === 'ar' ? p.name_ar : p.name_en);
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div>
          <span style="color:var(--g);font-weight:700;margin-${lang==='ar'?'left':'right'}:6px">${i+1}.</span>
          <span style="font-weight:500">${nm}</span>
          <span style="color:var(--mu);font-size:11px;margin-${lang==='ar'?'right':'left'}:6px">${escHtml(p.brand)}</span>
        </div>
        <div style="text-align:${lang==='ar'?'left':'right'}">
          <span style="color:var(--gr);font-weight:700">${fmtNum(sold)} ${t('totalSold')}</span>
          <div style="font-size:10px;color:var(--mu)">${fmtNum(Math.round(p.revenue))} ${t('aed')}</div>
        </div>
      </div>
      <div style="height:6px;background:rgba(255,255,255,.07);border-radius:3px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--g),rgba(201,168,76,.4));border-radius:3px;transition:width .6s"></div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

// ── Status breakdown: horizontal progress bars ───────────
function renderStatusChart(data) {
  const el = document.getElementById('status-chart-wrap');
  if (!el) return;
  if (!data.length) { el.innerHTML = `<div class="empty-state" style="padding:20px"><p>${lang==='ar'?'لا توجد بيانات':'No data'}</p></div>`; return; }
  const total = data.reduce((s, d) => s + parseInt(d.count || 0), 0) || 1;
  const colorMap = { pending:'#f0a500', confirmed:'#4ca3c9', shipped:'#7a6de8',
                     delivered:'#4caf72', cancelled:'#c94c4c' };
  el.innerHTML = `<div style="padding:16px">${data.map(d => {
    const cnt   = parseInt(d.count || 0);
    const pct   = Math.round(cnt / total * 100);
    const color = colorMap[d.status] || '#888';
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:13px;font-weight:500">${t(d.status) || d.status}</span>
        <span style="font-size:13px;font-weight:700;color:${color}">${cnt} <small style="color:var(--mu)">(${pct}%)</small></span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,.07);border-radius:5px">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:5px;transition:width .7s"></div>
      </div>
    </div>`;
  }).join('')}
  <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);font-size:11px;color:var(--mu);text-align:center">
    ${lang==='ar'?'الإجمالي':'Total'}: <strong style="color:var(--tx)">${fmtNum(total)}</strong> ${lang==='ar'?'طلب':'orders'}
  </div></div>`;
}

// ── INIT ─────────────────────────────────────────────────
function initAdmin() {
  loadAuth();

  // Apply translations first (sets dir/lang, fills data-i18n elements)
  applyTranslations();

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
        <a href="/" class="btn-primary" style="margin-top:16px;display:inline-flex">${t('goToStore')}</a>
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

document.addEventListener('DOMContentLoaded', async function () {
  await loadAdminLang();
  initAdmin();
});
