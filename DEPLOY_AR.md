# خطوات الرفع على Cloudflare + ربط Supabase

## 1) جهّز قاعدة البيانات في Supabase
1. افتح مشروعك في [supabase.com](https://supabase.com) (أو أنشئ مشروع جديد مجاني).
2. روح لـ **SQL Editor** وشغّل محتوى ملف `supabase-schema.sql` اللي جوه المشروع، مرة واحدة بس.
3. من **Project Settings -> API** خد:
   - `Project URL` → ده الـ `SUPABASE_URL`
   - `service_role` secret key → ده الـ `SUPABASE_SERVICE_ROLE_KEY`
   ⚠️ **متستخدمش الـ anon key** — لازم الـ service_role عشان الفنكشنز تقدر تكتب وتقرا وتمسح من غير قيود RLS.

## 2) ارفع المشروع على Cloudflare Pages
1. ارفع المجلد ده على GitHub (أو اسحبه مباشرة في Cloudflare Dashboard كـ direct upload).
2. من Cloudflare Dashboard: **Workers & Pages -> Create -> Pages -> Connect to Git** (أو Direct Upload).
3. إعدادات الـ Build:
   - **Build command:** `npm install` (أو سيبه فاضي، مفيش build حقيقي)
   - **Build output directory:** `/` (الروت)
4. روح **Settings -> Environment variables** وضيف:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   (ضيفهم لـ Production وPreview كمان لو هتستخدم preview deployments)
5. اعمل Deploy (لو ضفت الـ env vars بعد أول Deploy، لازم تعمل Redeploy تاني عشان الفنكشنز تقرا القيم الجديدة — إضافة env var لوحدها من غير Redeploy مبتتفعّلش).

## 3) لو ظهر "خطأ في الاتصال" برضو
افتح `https://<موقعك>.pages.dev/api/health` في المتصفح مباشرة. هيرجعلك JSON بيقولك:
- `has_SUPABASE_URL` و `has_SUPABASE_SERVICE_ROLE_KEY` (أو `has_SUPABASE_SECRET_KEY`) لازم يكونوا `true` — لو أي واحد `false` يبقى الـ env variable مش متسجل صح في Cloudflare (تأكد من الاسم بالظبط، ومن إنه مضاف لـ Production).
- `supabase_reachable: true` معناها الاتصال بقاعدة البيانات تمام. لو `false`، شوف `supabase_status` و`error` جنبها — غالبًا يبقى الجدول لسه متعملوش (رجّع خطوة 1 وشغّل `supabase-schema.sql`) أو المفتاح غلط.

الكود دلوقتي بيقبل اسم الـ env variable إما `SUPABASE_SERVICE_ROLE_KEY` (القديم) أو `SUPABASE_SECRET_KEY` (الجديد بصيغة `sb_secret_...`)، فمش لازم تتقيد باسم معين.

## 4) تأكيد إن كل حاجة شغالة
- افتح الموقع، سجّل أوردر تجريبي.
- روح لـ Supabase -> Table Editor -> جدول `orders`، هتلاقي الأوردر اتسجل كصف فعلي في قاعدة البيانات.
- اقفل الموقع وافتحه تاني (أو من جهاز تاني) — الأوردرات هتظهر زي ما هي، لأنها متخزنة في Postgres مش في المتصفح.
- الحذف مش بيحصل إلا لما تدوس زرار المسح من لوحة الأدمن (delete-order / clear-orders) — مفيش أي auto-expiry أو auto-cleanup في الكود.

## ملاحظات مهمة
- الملفات الثابتة (`index.html`, `manifest.json`, إلخ) اترفعت زي ما هي، من غير أي تعديل في واجهة المستخدم.
- كل الـ API routes (`/api/menu`, `/api/orders`, إلخ) اتحولت من Netlify Functions لـ Cloudflare Pages Functions، بنفس المسارات بالظبط، فمفيش أي تعديل مطلوب في الفرونت إند.
- التخزين اتنقل من Netlify Blobs لـ Supabase Postgres عن طريق REST API مباشرة (مفيش SDK)، عشان يشتغل بسلاسة جوه Cloudflare Workers من غير مشاكل bundling.
