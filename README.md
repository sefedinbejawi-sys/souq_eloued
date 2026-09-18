# سوق الوادي — Professional Marketplace

منصة بيع وشراء عربية/عالمية جاهزة للتطوير، مبنية بـ React + Vite + Supabase.

## المزايا
- تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.
- تسجيل الدخول بواسطة Google OAuth عبر Supabase.
- إنشاء حساب مع نوع الحساب: مشتري / بائع / مشتري وبائع.
- استعادة كلمة المرور عبر البريد الإلكتروني.
- لوحة البائع: كل الإعلانات، قيد المراجعة، المنشورة، المباعة، المشاهدات.
- إعادة نشر الإعلان بعد 7 أيام إذا بقي منشوراً وغير مباع.
- نظام مراجعة قبل النشر.
- لوحة إدارة للمشرف/المدير لإدارة الإعلانات والمستخدمين.
- Supabase RLS + Storage لحماية البيانات والملفات.
- بنية قابلة للتوسع لإضافة التصنيفات والبلدان واللغات والدفع والشحن لاحقاً.

## النشر
```bash
npm install
npm run typecheck
npm run build
```

متغيرات البيئة:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SITE_URL=https://souq.myeloued.com`

## Supabase Auth
أضف إلى Authentication → URL Configuration:
- Site URL: `https://souq.myeloued.com`
- Redirect: `https://souq.myeloued.com/auth/confirmed`
- Redirect: `https://souq.myeloued.com/auth/reset`

بالنسبة لـ Google، استخدم Callback URL الذي يعرضه Supabase داخل إعداد Google Provider / Google Cloud، ولا تستخدم service_role في الواجهة.

## قاعدة البيانات
نفّذ `supabase/schema.sql` على مشروع جديد فقط، أو نفّذ `supabase/migration_professional_marketplace.sql` على قاعدة المشروع الحالية بعد التأكد من وجود الجداول الأساسية.
