-- ============================================================
-- Food Order App - Supabase Schema
-- شغّل الملف ده مرة واحدة بس، من Supabase Dashboard -> SQL Editor
-- ============================================================

-- جدول الإعدادات (المنيو + الأسعار) - بديل Netlify Blobs key/value
create table if not exists app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- جدول الأوردرات - كل أوردر محفوظ سطر لوحده، وفاضل لحد ما الأدمن يمسحه بنفسه
create table if not exists orders (
  id bigint primary key,
  type text not null,
  name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_name_type_idx on orders (name, type);

-- تأمين الجداول: RLS شغال، وما فيش أي policy عامة.
-- الوصول الوحيد المسموح بيه هو عن طريق الـ service_role key اللي بتستخدمه
-- الـ Cloudflare Functions بتاعتك من السيرفر (بيتخطى RLS تلقائيًا).
-- يعني محدش من المتصفح يقدر يقرا أو يمسح أو يعدل حاجة مباشرة.
alter table app_config enable row level security;
alter table orders enable row level security;
