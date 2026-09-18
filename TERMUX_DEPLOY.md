# نشر سوق الوادي (النسخة الاحترافية) من Termux

## 1) تجهيز البيئة وفك الضغط

```bash
pkg update -y
pkg install git nodejs unzip -y
cd ~/storage/downloads
unzip souq_eloued-main-professional.zip
cd souq_eloued-main
```

## 2) تثبيت الحزم وضبط متغيرات البيئة

```bash
npm install
cp .env.example .env.local
nano .env.local
```

عبّئ في `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SITE_URL=https://souq.myeloued.com
```
(احفظ في nano بـ CTRL+O ثم Enter، اخرج بـ CTRL+X)

## 3) فحص وبناء محلي قبل الرفع

```bash
npm run typecheck
npm run build
```
يجب أن ينتهي الأمران بدون أخطاء قبل المتابعة.

## 4) رفع الكود إلى المستودع

المستودع المستهدف: `https://github.com/sefedinbejawi-sys/souq_eloued.git`

```bash
git init
git branch -M main
git add .
git commit -m "Professional marketplace platform"
git remote add origin https://github.com/sefedinbejawi-sys/souq_eloued.git
git push -u origin main
```

> إذا كان المستودع يحتوي بالفعل على تاريخ (README أولي مثلاً) وظهر خطأ رفض عند `push`، نفّذ بدلاً من الأمر الأخير:
> ```bash
> git pull origin main --allow-unrelated-histories
> git push -u origin main
> ```

عند الطلب من GitHub بخصوص تسجيل الدخول، استخدم **Personal Access Token** (وليس كلمة المرور العادية) — يُنشأ من:
`GitHub → Settings → Developer settings → Personal access tokens`

## 5) الربط مع Vercel والنشر

- استورد المستودع `souq_eloued` داخل Vercel.
- Build command: `npm run build`
- Output directory: `dist`
- أضف نفس متغيرات البيئة الثلاثة من `.env.local` داخل إعدادات Vercel (Environment Variables).
- اربط النطاق `souq.myeloued.com` بالمشروع من تبويب Domains.

## 6) إعداد Supabase قبل الاختبار

في Supabase: **Authentication → URL Configuration**:
- Site URL: `https://souq.myeloued.com`
- Redirect URLs: أضف
  - `https://souq.myeloued.com/auth/confirmed`
  - `https://souq.myeloued.com/auth/reset`

ثم في **SQL Editor** نفّذ الملف `supabase/migration_professional_marketplace.sql` (وليس `schema.sql` كاملاً إذا كانت القاعدة الحالية تعمل فعلاً — الـ migration آمن ولا يمس البيانات الموجودة).

## 7) تحديثات لاحقة من Termux

بعد أي تعديل على الكود، لرفعه مجدداً:
```bash
git add .
git commit -m "وصف التحديث"
git push
```
Vercel سينشر تلقائياً عند كل push إلى `main`.
