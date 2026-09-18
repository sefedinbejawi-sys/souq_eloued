import type { ReactNode } from 'react';
import { Mail, MapPin, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaticPage } from './StaticPage';

export function AboutPage() {
  return <StaticPage title="من نحن" description="تعرّف على سوق الوادي، المنصة المحلية للإعلانات المبوبة والبيع والشراء والخدمات في ولاية الوادي.">
    <section><p className="lead">سوق الوادي هو سوق رقمي محلي صُمم ليجمع سكان ولاية الوادي في مساحة بسيطة وآمنة للتواصل، البيع، الشراء، واكتشاف الخدمات القريبة منهم.</p><p>نؤمن أن التجارة المحلية تصبح أفضل عندما تكون المعلومات واضحة، والوصول سهلاً، والتواصل مباشراً بين صاحب الإعلان والمهتم به. لذلك نعمل على تقديم تجربة عربية سريعة ومناسبة للهاتف، مع تنظيم الإعلانات حسب التصنيف والبلدية.</p></section>
    <div className="my-8 grid gap-3 sm:grid-cols-3"><Value icon={<MapPin/>} title="محلي وقريب" text="نركز على ولاية الوادي وبلدياتها ومجتمعها المحلي."/><Value icon={<Users/>} title="مجتمع متصل" text="نقرّب البائعين والمشترين وأصحاب الخدمات."/><Value icon={<ShieldCheck/>} title="وضوح وثقة" text="نراجع الإعلانات ونشجع على التعامل الواعي."/></div>
    <section><h2>ماذا نقدم؟</h2><p>يمكن للمستخدمين استكشاف الإعلانات، البحث عن المنتجات والخدمات، التواصل مع أصحابها، وإنشاء إعلاناتهم الخاصة بعد تسجيل الدخول. كما نوفر لوحة للبائع لمتابعة حالة الإعلان ومراجعته وتحديث معلوماته.</p></section>
    <section><h2>رؤيتنا</h2><p>أن يصبح سوق الوادي الوجهة الرقمية الأولى للتجارة المحلية في الولاية، وأن نساعد المشاريع الصغيرة والأفراد على الوصول إلى جمهور مناسب بطريقة محترمة وعملية.</p></section>
    <div className="callout"><b>مهم:</b> سوق الوادي منصة للتواصل بين المستخدمين، وليست طرفاً في عمليات البيع أو الشراء. ننصح دائماً بمعاينة السلعة والتحقق من المعلومات قبل الدفع.</div>
  </StaticPage>;
}

export function ContactPage() {
  return <StaticPage title="اتصل بنا" description="تواصل مع فريق سوق الوادي للاستفسارات، الاقتراحات، التبليغ عن إعلان مخالف، أو طلب المساعدة.">
    <p className="lead">يسعدنا الاستماع إليك. أرسل استفسارك أو اقتراحك وسنعمل على الرد ومساعدتك بأقرب وقت ممكن.</p>
    <div className="my-7 grid gap-4 sm:grid-cols-2"><ContactCard icon={<Mail/>} title="البريد الإلكتروني" text="للاستفسارات العامة والمساعدة" value="contact@souq.myeloued.com" href="mailto:contact@souq.myeloued.com"/><ContactCard icon={<MessageCircle/>} title="التبليغ عن إعلان" text="أرسل رابط الإعلان وسبب التبليغ" value="استخدم البريد الإلكتروني" href="mailto:contact@souq.myeloued.com?subject=%D8%AA%D8%A8%D9%84%D9%8A%D8%BA%20%D8%B9%D9%86%20%D8%A5%D8%B9%D9%84%D8%A7%D9%86"/></div>
    <section><h2>ماذا تذكر في رسالتك؟</h2><ul><li>الاسم والبريد الإلكتروني المستخدم في الحساب، إن وجد.</li><li>وصف واضح للاستفسار أو المشكلة.</li><li>رابط الإعلان أو لقطة شاشة عند التبليغ عن محتوى مخالف.</li></ul></section>
    <section><h2>ملاحظات مهمة</h2><p>لا ترسل كلمات المرور أو رموز التحقق أو بيانات الدفع عبر البريد. لا تتولى المنصة عمليات الدفع أو الشحن، لذلك يرجى اتخاذ الاحتياطات اللازمة عند التواصل مع أي مستخدم.</p></section>
  </StaticPage>;
}

export function TermsPage() {
  return <StaticPage title="الشروط والأحكام" description="الشروط والأحكام المنظمة لاستخدام منصة سوق الوادي ونشر الإعلانات والتواصل بين المستخدمين.">
    <p className="lead">باستخدام سوق الوادي، فإنك توافق على الالتزام بهذه الشروط وعلى استخدام المنصة بطريقة قانونية ومسؤولة.</p>
    <Section title="1. استخدام المنصة"><p>يجب أن تكون المعلومات التي تقدمها صحيحة ومحدثة، وأن تستخدم حسابك بنفسك وألا تنتحل شخصية شخص أو جهة أخرى. التسجيل مطلوب لإضافة الإعلانات وإدارة الحساب.</p></Section>
    <Section title="2. الإعلانات والمحتوى"><p>يتحمل صاحب الإعلان مسؤولية العنوان والوصف والسعر والصور وبيانات التواصل. يجب ألا يتضمن الإعلان سلعاً أو خدمات ممنوعة قانوناً، أو محتوى مضللاً، أو إساءة، أو تمييزاً، أو بيانات أشخاص دون إذنهم.</p></Section>
    <Section title="3. المراجعة والإزالة"><p>تتم مراجعة الإعلانات قبل نشرها. تحتفظ إدارة سوق الوادي بحق رفض أو أرشفة أو إزالة أي إعلان يخالف الشروط أو يضر بتجربة المستخدم، كما قد تعيد الإعلان إلى المراجعة بعد تعديله.</p></Section>
    <Section title="4. المعاملات بين المستخدمين"><p>سوق الوادي وسيط تقني للتواصل فقط وليست طرفاً في البيع أو الشراء أو الشحن أو الدفع. تقع مسؤولية التحقق من السلعة والسعر والبائع وطريقة التسليم على الأطراف المتعاملة.</p></Section>
    <Section title="5. الحسابات والأمان"><p>احفظ بيانات دخولك ولا تشاركها مع أي شخص. يجوز تقييد أو إيقاف الحسابات التي تستخدم المنصة بطريقة مسيئة أو مخالفة للقانون.</p></Section>
    <div className="callout"><b>السلامة أولاً:</b> قابل الطرف الآخر في مكان آمن، عاين السلعة قبل الدفع، ولا ترسل معلومات حساسة أو مبالغ مسبقة دون تحقق.</div>
  </StaticPage>;
}

export function PrivacyPage() {
  return <StaticPage title="سياسة الخصوصية" description="تعرف على كيفية جمع واستخدام وحماية البيانات الشخصية في منصة سوق الوادي.">
    <p className="lead">نحترم خصوصيتك ونلتزم بجمع الحد الأدنى من البيانات اللازمة لتشغيل سوق الوادي وتحسين أمانه وتجربته.</p>
    <Section title="1. البيانات التي نجمعها"><p>قد نجمع الاسم الكامل، اسم المستخدم، البريد الإلكتروني، نوع الحساب، رقم الهاتف عند تقديمه، ومعلومات الإعلانات التي تنشرها. كما قد نجمع بيانات تقنية أساسية مثل المسار الذي تمت زيارته لتحسين أداء الموقع.</p></Section>
    <Section title="2. كيف نستخدم البيانات"><p>نستخدم البيانات لإنشاء الحساب وتسجيل الدخول، عرض معلومات الإعلان، تمكين التواصل بين المستخدمين، مراجعة المحتوى، حماية المنصة من الاستخدام المضر، وتحسين الخدمات.</p></Section>
    <Section title="3. المشاركة والحماية"><p>لا نبيع بياناتك الشخصية لأغراض تجارية. قد تظهر المعلومات التي تضعها داخل إعلانك للزوار، مثل الاسم أو الهاتف أو WhatsApp، لذلك لا تنشر معلومات لا ترغب في مشاركتها. نستخدم خدمات استضافة وقاعدة بيانات موثوقة لتشغيل المنصة ونطبق صلاحيات وصول على مستوى الحساب.</p></Section>
    <Section title="4. ملفات الارتباط والجلسات"><p>يستخدم الموقع التخزين المحلي والجلسات اللازمة لتذكر تسجيل الدخول وبعض تفضيلات الاستخدام. يمكنك حذفها من إعدادات المتصفح، لكن ذلك قد يؤثر على بعض وظائف الموقع.</p></Section>
    <Section title="5. حقوقك"><p>يمكنك تحديث معلومات حسابك من صفحة الحساب، كما يمكنك التواصل معنا لطلب المساعدة المتعلقة ببياناتك أو التبليغ عن استخدام غير مصرح به.</p></Section>
    <div className="callout"><b>آخر تحديث:</b> سبتمبر 2026. قد نحدّث هذه السياسة عند إضافة وظائف جديدة، وسنوضح أي تغييرات جوهرية داخل الموقع.</div>
  </StaticPage>;
}

function Section({ title, children }: { title: string; children: ReactNode }) { return <section><h2>{title}</h2>{children}</section>; }
function Value({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#e7663c] shadow-sm">{icon}</span><b className="mt-3 block text-sm text-[#18394c]">{title}</b><p className="mt-1 text-xs leading-6 text-slate-500">{text}</p></div>; }
function ContactCard({ icon, title, text, value, href }: { icon: ReactNode; title: string; text: string; value: string; href: string }) { return <a href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-[#e7663c] hover:bg-[#fff8f5]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#e7663c] shadow-sm">{icon}</span><b className="mt-4 block text-sm text-[#18394c]">{title}</b><p className="mt-1 text-xs leading-6 text-slate-500">{text}</p><strong className="mt-3 block break-all text-xs text-[#e7663c]">{value}</strong></a>; }
