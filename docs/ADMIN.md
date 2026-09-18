# سوق الوادي: المصادقة ولوحة الإدارة

## التسجيل والدخول

يسجل المستخدم حساباً جديداً باستخدام الاسم الكامل واسم المستخدم والبريد الإلكتروني وكلمة المرور. يصل رابط تفعيل البريد إلى المسار:

```text
https://souq.myeloued.com/auth/confirmed
```

يمكن تسجيل الدخول باستخدام البريد الإلكتروني أو اسم المستخدم مع كلمة المرور. يتوفر زر Google OAuth عندما يكون Google Provider مفعلاً في Supabase.

يجب إضافة الرابط التالي إلى Supabase Authentication > URL Configuration > Redirect URLs:

```text
https://souq.myeloued.com/auth/confirmed
```

ويجب ضبط Site URL على:

```text
https://souq.myeloued.com
```

## الأدوار

القيم المسموحة حصراً هي:

```text
user
moderator
admin
```

لا تستخدم قيم `viewer` أو `operator`.

## تفعيل أول مدير

بعد إنشاء الحساب وتأكيد البريد، نفّذ في Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin', is_banned = false, updated_at = now()
where email = 'admin@example.com';
```

ثم سجّل الخروج والدخول من جديد، وافتح:

```text
https://souq.myeloued.com/admin
```

## الصلاحيات

يمتلك `admin` صلاحية إدارة الإعلانات والمستخدمين، تغيير الأدوار، الحظر، والتعديل والحذف النهائي. يمتلك `moderator` صلاحية مراجعة الإعلانات وقبولها أو رفضها وتعديلها، ولا يمتلك صلاحية حذف إعلان نهائياً أو إدارة المستخدمين. المستخدم العادي لا يستطيع فتح لوحة الإدارة.

الإعلان الجديد يُحفظ بحالة `draft` ولا يظهر للعامة حتى يوافق عليه مدير أو مشرف.

## الحماية

تتحقق الواجهة من الدور، وتطبق قاعدة البيانات الحماية عبر دوال `security definer` باسم `is_admin()` و`is_moderator()` وسياسات RLS. لا يعتمد الأمان على الواجهة وحدها.
