# سوق الوادي — Souq El Oued

منصة تجارة وإعلانات محلية موجهة لولاية الوادي، مبنية بـ React + TypeScript + Vite + Tailwind CSS.

## الوضع الحالي

هذه النسخة هي **واجهة MVP احترافية قابلة للتطوير** وتشمل:
- بحث وفلاتر حسب البلدية والتصنيف.
- تصنيفات محلية للمنتجات والخدمات.
- بطاقات إعلانات حديثة ومتجاوبة.
- مفضلة محفوظة في LocalStorage.
- تفاصيل الإعلان والتواصل عبر الهاتف وWhatsApp.
- نموذج أولي لتسجيل الدخول ونشر الإعلان.
- دعم البلديات الحالية المستخدمة في نطاق ولاية الوادي.

البيانات الحالية تجريبية؛ المرحلة الإنتاجية يجب أن تربط Supabase/Auth/Storage وقاعدة البيانات.

## التشغيل

```bash
npm install
npm run dev
```

## التحقق

```bash
npm run typecheck
npm run build
```

## خارطة الطريق الإنتاجية

1. Supabase Auth + Profiles + Roles.
2. PostgreSQL: listings/categories/municipalities/favorites/reports/messages.
3. Supabase Storage للصور مع ضغط WebP وthumbnails.
4. RLS صارم حسب المستخدم والدور.
5. لوحة Admin للمراجعة والبلاغات.
6. SEO وOpen Graph وSitemap.
7. PWA وتجربة هاتف ممتازة.
8. مراقبة الأخطاء والأداء والنسخ الاحتياطي.
9. نظام إعلانات مميزة ومتاجر موثقة.
10. اختبارات Unit/E2E وCI قبل كل نشر.
