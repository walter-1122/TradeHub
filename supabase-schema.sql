-- Trade Hub product database starter
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  moq text not null,
  image_url text,
  published boolean default true,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Public can view published products"
on products for select
using (published = true);

-- Owner INSERT/UPDATE/DELETE policies should be added after creating the owner's Supabase Auth account.
-- Do not expose a Supabase service-role key in website JavaScript.
