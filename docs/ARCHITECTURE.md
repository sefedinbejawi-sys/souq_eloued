# معمارية سوق الوادي

## الهيكلة المقترحة عند الانتقال إلى Next.js App Router

```text
app/
  (market)/
    page.tsx                  # الصفحة الرئيسية والإعلانات
    listings/[id]/page.tsx    # تفاصيل الإعلان
    sell/page.tsx             # إضافة إعلان في خطوتين
    profile/[id]/page.tsx
  auth/
    login/page.tsx
  api/
    listings/route.ts
    upload/route.ts
components/
  listings/
    listing-card.tsx
    listing-grid.tsx
    search-filters.tsx
    create-listing-form.tsx
  ui/                         # مكونات shadcn/ui المشتركة
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
  formatters.ts
  constants.ts
hooks/
  use-listing-filters.ts
  use-upload.ts
types/
  database.ts                 # الأنواع المولدة من Supabase
supabase/
  migrations/                 # ملفات SQL المتسلسلة
public/
  manifest.json
```

النسخة الحالية في المستودع تستخدم Vite + React، وتم تنفيذ الواجهة داخل `src/` حتى تعمل فوراً دون تغيير بنية البناء الحالية. مكونات `ListingCard` و`SearchFilters` معزولة وقابلة للنقل مباشرة إلى `components/listings/` في Next.js.

## التدفق المقترح للإعلان في خطوتين

الخطوة الأولى تجمع الصورة، العنوان، السعر، والبلدية. الخطوة الثانية تجمع التصنيف، الهاتف/واتساب، والوصف الاختياري. يتم رفع الصورة إلى Supabase Storage مع ضغط نسخة للمعاينة، ثم إدراج السجل في `listings` مع روابط الصور فقط.

## ملاحظات الأداء

تستخدم البطاقات `loading="lazy"` للصور، وتُفهرس حقول الحالة والبلدية والتصنيف في PostgreSQL. في الإنتاج يُفضّل استخدام صور تحويلية صغيرة عبر Storage Transformations، مع `next/image` عند الانتقال إلى Next.js.
