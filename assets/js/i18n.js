/**
 * ══════════════════════════════════════════════════════════════
 *  TORO — i18n.js  |  ملف الترجمات المركزي
 *  Single source of truth for ALL Arabic / English strings.
 *
 *  Usage:
 *    t('key')          → translated string for current lang
 *    ts('orderStatus') → translated order status
 *    twa('product', p) → WhatsApp message for a product
 *    twaCart(lines, total, addr, notes) → WhatsApp cart message
 *
 *  To add a new language:
 *    1. Add a new property alongside 'ar' and 'en' in every entry.
 *    2. Update applyLang() in main.js and the lang switch button.
 * ══════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────
// MAIN UI STRINGS
// ────────────────────────────────────────────────────────────
const TR = {
  // ── Hero & taglines ─────────────────────────────────────
  eye:     { ar: 'عطور فاخرة أصيلة',         en: 'Authentic Luxury Fragrances' },
  sub:     { ar: 'الإمارات العربية المتحدة',  en: 'United Arab Emirates' },
  tag:     { ar: 'الفاخر لا يحتاج مناسبة',   en: 'Luxury Needs No Occasion' },

  // ── Search & filters ────────────────────────────────────
  sph:     { ar: 'ابحث عن عطر أو ماركة…',    en: 'Search perfumes or brands…' },
  flt_all: { ar: 'الكل',                      en: 'All' },
  flt_men: { ar: 'رجالي',                     en: 'Men' },
  flt_wom: { ar: 'نسائي',                     en: 'Women' },
  flt_uni: { ar: 'للجنسين',                   en: 'Unisex' },

  // ── Trust badges ────────────────────────────────────────
  trust_ship:  { ar: 'توصيل مجاني',          en: 'Free Delivery' },
  trust_cod:   { ar: 'الدفع عند الاستلام',   en: 'Cash on Delivery' },
  trust_auth:  { ar: 'أصيل 100%',            en: '100% Authentic' },

  // ── Page titles ─────────────────────────────────────────
  pg_home:  { ar: 'الرئيسية',                en: 'Home' },
  pg_cart:  { ar: '🛒 السلة',               en: '🛒 Cart' },
  pg_chk:   { ar: '💳 إتمام الطلب',         en: '💳 Checkout' },
  pg_ord:   { ar: '📦 طلباتي',              en: '📦 My Orders' },
  pg_fav:   { ar: '❤️ المفضلة',            en: '❤️ Favorites' },
  pg_prof:  { ar: 'حسابي',                  en: 'Profile' },
  pg_about: { ar: 'من نحن',                 en: 'About Us' },
  pg_dash:  { ar: 'لوحة التحكم',            en: 'Dashboard' },

  // ── Cart & checkout ─────────────────────────────────────
  cart_empty:   { ar: 'السلة فارغة',         en: 'Cart is empty' },
  subtotal:     { ar: 'المجموع',             en: 'Subtotal' },
  shipping:     { ar: 'الشحن',              en: 'Shipping' },
  free:         { ar: 'مجاني',              en: 'Free' },
  total:        { ar: 'الإجمالي',           en: 'Total' },
  address_lbl:  { ar: 'العنوان التفصيلي',   en: 'Delivery Address' },
  notes_lbl:    { ar: 'ملاحظات',            en: 'Notes' },
  place_order:  { ar: 'تأكيد الطلب',        en: 'Place Order' },
  chk_note:     { ar: 'يمكنك إتمام الطلب عبر الموقع أو إرساله مباشرة على واتساب', en: 'Complete your order online or send directly via WhatsApp' },
  wa_btn:       { ar: 'واتساب',             en: 'WhatsApp' },

  // ── Product card & detail ───────────────────────────────
  add_cart:    { ar: 'أضف للسلة',           en: 'Add to Cart' },
  added_cart:  { ar: '✓ أضيف للسلة',       en: '✓ Added to cart' },
  currency:    { ar: 'د.إ',                 en: 'AED' },
  save_lbl:    { ar: 'وفّر',               en: 'Save' },
  origin_lbl:  { ar: 'الأصل',              en: 'Origin' },
  stock_lbl:   { ar: 'متبقي',              en: 'Left' },
  in_stock:    { ar: 'متوفر',              en: 'In Stock' },
  out_stock:   { ar: 'نفد',               en: 'Out of Stock' },
  no_desc:     { ar: 'لا يوجد وصف',        en: 'No description' },
  qty_lbl:     { ar: 'الكمية',             en: 'Quantity' },
  wa_order:    { ar: 'اطلب عبر واتساب',    en: 'Order via WhatsApp' },
  fav_add:     { ar: 'إضافة للمفضلة',      en: 'Add to favorites' },
  fav_remove:  { ar: 'إزالة من المفضلة',   en: 'Remove from favorites' },
  fav_added:   { ar: '❤️ أضيف للمفضلة',   en: '❤️ Added to favorites' },
  fav_removed: { ar: '🤍 حُذف من المفضلة', en: '🤍 Removed from favorites' },
  fav_login:   { ar: 'سجّل دخولك لإضافة للمفضلة', en: 'Login to add to favorites' },
  fav_empty:   { ar: 'لا توجد منتجات في المفضلة',  en: 'No favorites yet' },
  fav_login2:  { ar: 'سجّل دخولك لعرض المفضلة',   en: 'Login to view your favorites' },

  // ── Orders ──────────────────────────────────────────────
  no_orders:   { ar: 'لا توجد طلبات',       en: 'No orders yet' },
  order_ok:    { ar: '✓ تم تقديم طلبك!',   en: '✓ Order placed!' },
  enter_addr:  { ar: 'أدخل العنوان',        en: 'Enter address' },

  // ── Auth / profile ──────────────────────────────────────
  login_first: { ar: 'سجّل دخولك أولاً',   en: 'Please login first' },
  login_btn:   { ar: 'تسجيل الدخول',        en: 'Login' },
  register_btn:{ ar: 'حساب جديد',           en: 'Register' },
  logout_btn:  { ar: 'تسجيل الخروج',        en: 'Logout' },
  create_acc:  { ar: 'إنشاء الحساب',        en: 'Create Account' },
  my_orders:   { ar: '📦 طلباتي',          en: '📦 My Orders' },
  admin_panel: { ar: '⚙️ لوحة التحكم',     en: '⚙️ Dashboard' },
  logged_out:  { ar: 'تم تسجيل الخروج',    en: 'Logged out' },
  welcome:     { ar: 'مرحباً ',            en: 'Welcome ' },
  bad_creds:   { ar: 'بيانات خاطئة',        en: 'Invalid credentials' },
  fill_all:    { ar: 'أكمل جميع الحقول',   en: 'Fill all fields' },
  pw_short:    { ar: 'كلمة المرور 6 أحرف على الأقل', en: 'Minimum 6 characters' },
  acc_created: { ar: '✓ تم إنشاء الحساب',  en: '✓ Account created' },
  enter_creds: { ar: 'أدخل البريد وكلمة المرور', en: 'Enter email and password' },

  // ── Auth form field labels ──────────────────────────────
  email_lbl:      { ar: 'البريد الإلكتروني', en: 'Email' },
  pass_lbl:       { ar: 'كلمة المرور',        en: 'Password' },
  pass_hint_lbl:  { ar: 'كلمة المرور (٦+)',   en: 'Password (6+)' },
  name_lbl:       { ar: 'الاسم',              en: 'Name' },
  name_ph:        { ar: 'اسمك الكامل',        en: 'Full Name' },

  // ── Access control ──────────────────────────────────────
  access_denied: { ar: 'وصول مرفوض',        en: 'Access Denied' },
  admin_only:    { ar: 'هذه الصفحة للمديرين فقط. سجّل دخولك بحساب الأدمن.', en: 'This page is for admins only. Please login with an admin account.' },

  // ── Admin panel ─────────────────────────────────────────
  adm_products:  { ar: '📦 المنتجات',       en: '📦 Products' },
  adm_orders:    { ar: '🧾 الطلبات',        en: '🧾 Orders' },
  adm_users:     { ar: '👥 العملاء',        en: '👥 Customers' },
  adm_add_prod:  { ar: 'إضافة منتج جديد',  en: 'Add New Product' },
  adm_edit_prod: { ar: '✏️ تعديل المنتج',   en: '✏️ Edit Product' },
  adm_new_prod:  { ar: '+ إضافة منتج جديد', en: '+ Add New Product' },
  adm_save_prod: { ar: 'حفظ المنتج',        en: 'Save Product' },
  adm_saved:     { ar: '✓ تم الحفظ',       en: '✓ Saved' },
  adm_deleted:   { ar: 'تم الحذف',          en: 'Deleted' },
  adm_del_conf:  { ar: 'حذف هذا المنتج نهائياً؟', en: 'Delete this product permanently?' },
  adm_st_upd:    { ar: '✓ تم تحديث الحالة', en: '✓ Status updated' },
  adm_srch_prod: { ar: 'بحث في المنتجات…',  en: 'Search products…' },
  adm_srch_ord:  { ar: 'بحث في الطلبات…',   en: 'Search orders…' },
  adm_srch_usr:  { ar: 'بحث في العملاء…',   en: 'Search customers…' },
  adm_no_prods:  { ar: 'لا توجد منتجات',    en: 'No products found' },
  adm_no_ords:   { ar: 'لا توجد طلبات',     en: 'No orders' },
  adm_no_usrs:   { ar: 'لا يوجد مستخدمون',  en: 'No users found' },
  adm_pend:      { ar: 'معلق',              en: 'pending' },
  adm_prod_required: { ar: 'الاسم والماركة والسعر مطلوبة', en: 'Name, brand and price required' },

  // ── Stats labels ────────────────────────────────────────
  stat_prods:   { ar: 'منتجات نشطة',        en: 'Active Products' },
  stat_orders:  { ar: 'إجمالي الطلبات',     en: 'Total Orders' },
  stat_users:   { ar: 'عملاء مسجلون',       en: 'Registered Customers' },
  stat_rev:     { ar: 'الإيرادات (د.إ)',     en: 'Revenue (AED)' },

  // ── Table headers ────────────────────────────────────────
  th_product:  { ar: 'المنتج',              en: 'Product' },
  th_brand:    { ar: 'الماركة',             en: 'Brand' },
  th_category: { ar: 'الفئة',              en: 'Category' },
  th_before:   { ar: 'السعر قبل',           en: 'Before' },
  th_after:    { ar: 'السعر بعد',           en: 'After' },
  th_disc:     { ar: 'الخصم',              en: 'Disc' },
  th_stock:    { ar: 'المخزون',             en: 'Stock' },
  th_status:   { ar: 'الحالة',             en: 'Status' },
  th_action:   { ar: 'إجراء',              en: 'Action' },
  th_id:       { ar: '#',                  en: '#' },
  th_customer: { ar: 'العميل',             en: 'Customer' },
  th_ttl:      { ar: 'الإجمالي',           en: 'Total' },
  th_date:     { ar: 'التاريخ',            en: 'Date' },
  th_update:   { ar: 'تحديث',             en: 'Update' },
  th_name:     { ar: 'الاسم',             en: 'Name' },
  th_email:    { ar: 'البريد الإلكتروني',  en: 'Email' },
  th_role:     { ar: 'الدور',             en: 'Role' },
  th_joined:   { ar: 'تاريخ التسجيل',     en: 'Joined' },

  // ── Role / category labels ───────────────────────────────
  role_admin:  { ar: '⚙️ مدير',            en: '⚙️ Admin' },
  role_cust:   { ar: '👤 عميل',            en: '👤 Customer' },
  cat_men:     { ar: 'رجالي',              en: 'Men' },
  cat_women:   { ar: 'نسائي',             en: 'Women' },
  cat_unisex:  { ar: 'للجنسين',           en: 'Unisex' },
  status_on:   { ar: 'نشط',              en: 'Active' },
  status_off:  { ar: 'مخفي',             en: 'Hidden' },

  // ── Misc ────────────────────────────────────────────────
  no_results:  { ar: 'لا نتائج',           en: 'No results' },
  error_lbl:   { ar: 'خطأ',               en: 'Error' },
  close_lbl:   { ar: 'إغلاق',             en: 'Close' },
  view_lbl:    { ar: 'عرض',               en: 'View' },
  cancel_lbl:  { ar: 'إلغاء',             en: 'Cancel' },
  order_no:    { ar: 'طلب رقم',           en: 'Order' },
  customer_lbl:{ ar: 'العميل',            en: 'Customer' },
  address_lbl2:{ ar: 'العنوان',           en: 'Address' },
  notes_lbl2:  { ar: 'ملاحظات',           en: 'Notes' },
  wa_contact:  { ar: 'تواصل عبر واتساب',  en: 'Contact via WhatsApp' },
  wa_order_no: { ar: 'طلب رقم',           en: 'Order' },
  wa_qty:      { ar: 'الكمية',            en: 'Qty' },
  preview_lbl: { ar: 'معاينة',            en: 'Preview' },
  bad_link:    { ar: 'رابط غير صحيح',     en: 'Invalid link' },
  store_link:  { ar: '🛍 المتجر',         en: '🛍 Store' },

  // ── Bottom-nav labels (no emoji) ───────────────────────
  nav_cart:    { ar: 'السلة',             en: 'Cart' },
  nav_fav:     { ar: 'المفضلة',           en: 'Favorites' },
  nav_orders:  { ar: 'طلباتي',            en: 'Orders' },

  // ── Address placeholder ─────────────────────────────────
  address_ph:  { ar: 'الإمارة / المدينة / الحي / الشارع', en: 'Emirate / City / District / Street' },

  // ── Order detail modal ──────────────────────────────────
  ord_detail_title: { ar: 'تفاصيل الطلب', en: 'Order Details' },

  // ── Admin product-form field labels ─────────────────────
  adm_f_nar:    { ar: 'الاسم بالعربي *',         en: 'Name (Arabic) *' },
  adm_f_nen:    { ar: 'الاسم بالإنجليزي *',       en: 'Name (English) *' },
  adm_f_brand:  { ar: 'الماركة *',               en: 'Brand *' },
  adm_f_origin: { ar: 'الأصل',                   en: 'Origin' },
  adm_f_cat:    { ar: 'التصنيف',                  en: 'Category' },
  adm_f_price:  { ar: 'السعر الحالي (درهم) *',   en: 'Current Price (AED) *' },
  adm_f_before: { ar: 'السعر قبل الخصم',           en: 'Price Before Discount' },
  adm_f_stock:  { ar: 'المخزون',                  en: 'Stock' },
  adm_f_status: { ar: 'الحالة',                   en: 'Status' },
  adm_f_image:  { ar: 'رابط الصورة',              en: 'Image URL' },
  adm_f_dar:    { ar: 'الوصف بالعربي',            en: 'Description (Arabic)' },
  adm_f_den:    { ar: 'الوصف بالإنجليزي',         en: 'Description (English)' },

  // ── Admin product-form placeholders ─────────────────────
  adm_ph_nar:   { ar: 'عود الملكي',               en: 'Royal Oud' },
  adm_ph_nen:   { ar: 'Royal Oud',                en: 'Royal Oud' },
  adm_ph_brand: { ar: 'TORO, Chanel...',          en: 'TORO, Chanel...' },
  adm_ph_origin:{ ar: 'UAE, France...',           en: 'UAE, France...' },
  adm_ph_image: { ar: 'https://example.com/photo.jpg', en: 'https://example.com/photo.jpg' },
  adm_ph_dar:   { ar: 'وصف العطر...',             en: 'Fragrance description...' },
  adm_ph_den:   { ar: 'Description...',           en: 'Description...' },

  // ── About page ───────────────────────────────────────────
  about_title:   { ar: 'من نحن',           en: 'About Us' },
  about_tagline: { ar: 'نحن لا نبيع عطوراً — نبيع لحظات لا تُنسى',
                   en: 'We don\'t sell fragrances — we sell unforgettable moments' },
  about_story_title: { ar: 'قصتنا',        en: 'Our Story' },
  about_story: {
    ar: 'وُلدت TORO في قلب الإمارات العربية المتحدة من شغف حقيقي بعالم العطور الأصيلة. منذ يومنا الأول، آمنّا بأن العطر الجيد ليس رفاهية — بل هو هوية. جمعنا أرقى العطور من أعرق الدور العالمية وأجود دور العطور الإماراتية والخليجية لتصل إليك بضمان الجودة والأصالة.',
    en: 'TORO was born in the heart of the UAE from a genuine passion for authentic fragrances. From day one, we believed that a great perfume is not a luxury — it is an identity. We curated the finest scents from the world\'s most prestigious houses and the UAE\'s finest perfumeries, delivered to you with a guarantee of quality and authenticity.'
  },
  about_val1_title: { ar: 'الأصالة أولاً',  en: 'Authenticity First' },
  about_val1:       { ar: 'كل منتج في متجرنا مضمون الأصالة 100%. لا مقلّدات، لا مجاملات.',
                      en: 'Every product in our store is 100% guaranteed authentic. No imitations, no compromises.' },
  about_val2_title: { ar: 'خدمة بلا حدود',  en: 'Service Without Limits' },
  about_val2:       { ar: 'فريقنا متاح على مدار الساعة للإجابة على استفساراتك ومساعدتك في اختيار عطرك المثالي.',
                      en: 'Our team is available around the clock to answer your questions and help you choose your perfect scent.' },
  about_val3_title: { ar: 'توصيل سريع',      en: 'Fast Delivery' },
  about_val3:       { ar: 'نوصّل إلى جميع إمارات الدولة في أسرع وقت، مع خيار الدفع عند الاستلام.',
                      en: 'We deliver across all Emirates as fast as possible, with cash-on-delivery option.' },
  about_contact_title: { ar: 'تواصل معنا',   en: 'Contact Us' },
  about_wa_cta:     { ar: 'راسلنا على واتساب', en: 'Message us on WhatsApp' },
  about_follow:     { ar: 'تابعنا على انستغرام', en: 'Follow us on Instagram' },

  // ── Order status ────────────────────────────────────────
  status: {
    pending:   { ar: 'قيد الانتظار', en: 'Pending' },
    confirmed: { ar: 'مؤكد',        en: 'Confirmed' },
    shipped:   { ar: 'تم الشحن',    en: 'Shipped' },
    delivered: { ar: 'تم التوصيل',  en: 'Delivered' },
    cancelled: { ar: 'ملغي',        en: 'Cancelled' }
  }
};

// ────────────────────────────────────────────────────────────
// WHATSAPP MESSAGE TEMPLATES
// ────────────────────────────────────────────────────────────
const TW = {
  /**
   * Single product order message
   * @param {string} lang   'ar' | 'en'
   * @param {object} p      product object
   * @param {number} qty
   * @param {string} aed    currency label
   */
  product(lang, p, qty, aed) {
    const nm   = lang === 'ar' ? p.name_ar : p.name_en;
    const disc = p.price_before ? ` (${lang === 'ar' ? 'كان' : 'was'} ${p.price_before} ${aed})` : '';
    return lang === 'ar'
      ? `✨ *متجر TORO للعطور*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `مرحباً 👋\nأرغب في طلب المنتج التالي:\n\n` +
        `🫙 *${nm}*\n` +
        `🏷️ الماركة: ${p.brand}\n` +
        `🌍 المنشأ: ${p.origin || '—'}\n` +
        `💰 السعر: *${p.price} ${aed}*${disc}\n` +
        `📦 الكمية: ${qty}\n\n` +
        `💵 *الإجمالي: ${(p.price * qty).toFixed(2)} ${aed}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💳 الدفع عند الاستلام`
      : `✨ *TORO Perfume Store*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `Hello 👋\nI'd like to order:\n\n` +
        `🫙 *${nm}*\n` +
        `🏷️ Brand: ${p.brand}\n` +
        `🌍 Origin: ${p.origin || '—'}\n` +
        `💰 Price: *${p.price} ${aed}*\n` +
        `📦 Qty: ${qty}\n\n` +
        `💵 *Total: ${(p.price * qty).toFixed(2)} ${aed}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💳 Cash on Delivery`;
  },

  /**
   * Full cart order message
   * @param {string} lang
   * @param {string[]} lines  formatted product lines
   * @param {number}   total
   * @param {string}   aed
   * @param {string}   addr
   * @param {string}   notes
   */
  cart(lang, lines, total, aed, addr, notes) {
    let msg = lang === 'ar'
      ? `✨ *متجر TORO للعطور*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `مرحباً 👋 لدي طلب جديد:\n\n` +
        `${lines.join('\n')}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💰 *الإجمالي: ${total.toFixed(2)} ${aed}*\n` +
        `🚚 الشحن: مجاني\n` +
        `💳 الدفع عند الاستلام`
      : `✨ *TORO Perfume Store*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `Hello 👋 New Order:\n\n` +
        `${lines.join('\n')}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💰 *Total: ${total.toFixed(2)} ${aed}*\n` +
        `🚚 Shipping: Free\n` +
        `💳 Cash on Delivery`;
    if (addr)  msg += `\n📍 ${lang === 'ar' ? 'العنوان' : 'Address'}: ${addr}`;
    if (notes) msg += `\n📝 ${lang === 'ar' ? 'ملاحظات' : 'Notes'}: ${notes}`;
    return msg;
  },

  /**
   * Admin order follow-up message
   * @param {string} lang
   * @param {object} o    order object
   * @param {string} aed
   */
  adminOrder(lang, o, aed) {
    const items = (o.items || [])
      .map(i => `🫙 *${lang === 'ar' ? i.name_ar : i.name_en}* × ${i.qty} — ${(i.price * i.qty).toFixed(0)} ${aed}`)
      .join('\n');
    return lang === 'ar'
      ? `✨ *متجر TORO للعطور*\n━━━━━━━━━━━━━━━━━━\n📋 *طلب رقم #${o.id}*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━\n💰 *الإجمالي: ${Number(o.total).toFixed(2)} ${aed}*\n👤 العميل: ${o.user_name || '—'}\n📍 العنوان: ${o.address || '—'}\n💳 الدفع عند الاستلام`
      : `✨ *TORO Perfume Store*\n━━━━━━━━━━━━━━━━━━\n📋 *Order #${o.id}*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━\n💰 *Total: ${Number(o.total).toFixed(2)} ${aed}*\n👤 Customer: ${o.user_name || '—'}\n📍 Address: ${o.address || '—'}\n💳 Cash on Delivery`;
  }
};

// ────────────────────────────────────────────────────────────
// ACCESSOR HELPERS  (set by main.js after lang is known)
// ────────────────────────────────────────────────────────────
/** Returns the translated string for key `k` in current lang */
function t(k) {
  if (!TR[k]) { console.warn('[i18n] missing key:', k); return k; }
  return TR[k][window._lang] || TR[k]['ar'] || k;
}

/** Returns the translated order status */
function ts(s) {
  return TR.status[s]?.[window._lang] || s;
}
