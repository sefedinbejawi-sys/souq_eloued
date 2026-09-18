import { supabase } from './supabase';

/** معرّف زائر عشوائي محفوظ محلياً، بدون أي بيانات شخصية، فقط لتمييز الزيارات المتكررة. */
function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem('souq_visitor_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('souq_visitor_id', id); }
    return id;
  } catch { return null; }
}

/**
 * يسجّل زيارة واحدة فقط لكل جلسة تصفح (sessionStorage) حتى لا تُحتسب
 * كل إعادة تحميل أو تنقّل بين الصفحات كزيارة منفصلة — فيبقى الرقم في
 * لوحة التحكم معبّراً عن "زيارات حقيقية" لا عن عدد طلبات الصفحة.
 */
export async function trackVisit(path: string) {
  if (!supabase) return;
  try {
    if (sessionStorage.getItem('souq_visit_logged')) return;
    sessionStorage.setItem('souq_visit_logged', '1');
    const visitorId = getVisitorId();
    if (!visitorId) return;
    await supabase.from('site_visits').insert({ visitor_id: visitorId, path, referrer: document.referrer || null });
  } catch {
    // فشل صامت — تسجيل الزيارة لا يجب أن يؤثر أبداً على تجربة المستخدم
  }
}
