-- ============================================================
-- Ink & Soul — Supabase Schema
-- Run this in the Supabase SQL Editor (one-time setup)
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text default '',
  role        text not null default 'client' check (role in ('artist','client')),
  avatar_url  text default '',
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. APPOINTMENTS
create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid references public.profiles(id) on delete set null,
  client_name       text not null default '',
  date              date not null,
  time              time not null,
  description       text default '',
  body_part         text default '',
  style             text default '',
  status            text not null default 'pending'
                      check (status in ('pending','confirmed','completed','rejected')),
  deposit           numeric(10,2) default 0,
  phone             text default '',
  email             text default '',
  reference_images  text[] default '{}',
  size              text default '',
  notes             text default '',
  created_at        timestamptz not null default now()
);

-- 3. PORTFOLIO ITEMS
create table if not exists public.portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  style       text default '',
  description text default '',
  image_url   text not null,
  published   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 4. SHOP ITEMS
create table if not exists public.shop_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  price       numeric(10,2) not null default 0,
  image_url   text not null,
  category    text not null check (category in ('cuadros','ropa','zapatos','accesorios')),
  description text default '',
  in_stock    boolean not null default true,
  sizes       text[] default '{}',
  colors      text[] default '{}',
  created_at  timestamptz not null default now()
);

-- 5. ORDERS
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references public.profiles(id) on delete set null,
  client_name     text not null default '',
  client_email    text not null default '',
  client_phone    text default '',
  client_address  text default '',
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','shipped','delivered')),
  total           numeric(10,2) not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  shop_item_id uuid not null references public.shop_items(id) on delete cascade,
  quantity     int not null default 1,
  size         text default '',
  color        text default '',
  price        numeric(10,2) not null default 0
);

-- 6. COURSES
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text default '',
  date        date not null,
  duration    text default '',
  price       numeric(10,2) not null default 0,
  spots       int not null default 0,
  image_url   text not null,
  level       text not null default 'beginner'
                check (level in ('beginner','intermediate','advanced')),
  created_at  timestamptz not null default now()
);

-- 7. COURSE RESERVATIONS
create table if not exists public.course_reservations (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  client_id  uuid references public.profiles(id) on delete set null,
  name       text not null default '',
  email      text not null default '',
  phone      text default '',
  created_at timestamptz not null default now()
);

-- 8. CHAT MESSAGES (realtime-enabled)
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('client','artist')),
  text        text not null default '',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 9. REMINDERS (artist-only)
create table if not exists public.reminders (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  date       date not null,
  time       time not null,
  type       text not null default 'custom'
               check (type in ('appointment','followup','custom')),
  completed  boolean not null default false,
  created_at timestamptz not null default now()
);

-- 10. CONTACT SUBMISSIONS
create table if not exists public.contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  email        text not null default '',
  phone        text default '',
  message      text default '',
  tattoo_style text default '',
  body_part    text default '',
  created_at   timestamptz not null default now()
);

-- 11. STUDIO SETTINGS (single-row config)
create table if not exists public.studio_settings (
  id            uuid primary key default gen_random_uuid(),
  studio_name   text default 'Ink & Soul',
  artist_name   text default 'Valentina Reyes',
  bio           text default '',
  phone         text default '',
  email         text default '',
  address       text default '',
  schedule      jsonb default '{}',
  prices        jsonb default '{}',
  social_links  jsonb default '{}',
  notifications jsonb default '{}',
  updated_at    timestamptz not null default now()
);

-- Insert default settings row
insert into public.studio_settings (studio_name, artist_name)
values ('Ink & Soul', 'Valentina Reyes')
on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles            enable row level security;
alter table public.appointments        enable row level security;
alter table public.portfolio_items     enable row level security;
alter table public.shop_items          enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.courses             enable row level security;
alter table public.course_reservations enable row level security;
alter table public.chat_messages       enable row level security;
alter table public.reminders           enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.studio_settings     enable row level security;

-- Helper: check if current user is artist
create or replace function public.is_artist()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'artist'
  );
$$ language sql security definer stable;

-- ---- PROFILES ----
create policy "Users can view own profile"
  on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());
create policy "Artist can view all profiles"
  on public.profiles for select using (public.is_artist());

-- ---- PORTFOLIO ITEMS ----
create policy "Anyone can view published portfolio"
  on public.portfolio_items for select using (published = true);
create policy "Artist full access portfolio"
  on public.portfolio_items for all using (public.is_artist());

-- ---- SHOP ITEMS ----
create policy "Anyone can view shop items"
  on public.shop_items for select using (true);
create policy "Artist full access shop"
  on public.shop_items for all using (public.is_artist());

-- ---- COURSES ----
create policy "Anyone can view courses"
  on public.courses for select using (true);
create policy "Artist full access courses"
  on public.courses for all using (public.is_artist());

-- ---- STUDIO SETTINGS ----
create policy "Anyone can view studio settings"
  on public.studio_settings for select using (true);
create policy "Artist can update studio settings"
  on public.studio_settings for update using (public.is_artist());

-- ---- APPOINTMENTS ----
create policy "Clients see own appointments"
  on public.appointments for select using (client_id = auth.uid());
create policy "Artist sees all appointments"
  on public.appointments for select using (public.is_artist());
create policy "Authenticated users can create appointments"
  on public.appointments for insert with check (auth.uid() is not null);
create policy "Artist can update appointments"
  on public.appointments for update using (public.is_artist());
create policy "Artist can delete appointments"
  on public.appointments for delete using (public.is_artist());

-- ---- ORDERS ----
create policy "Clients see own orders"
  on public.orders for select using (client_id = auth.uid());
create policy "Authenticated users can create orders"
  on public.orders for insert with check (auth.uid() is not null);
create policy "Artist sees all orders"
  on public.orders for select using (public.is_artist());
create policy "Artist can update orders"
  on public.orders for update using (public.is_artist());

-- ---- ORDER ITEMS ----
create policy "Users can view own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.client_id = auth.uid())
  );
create policy "Authenticated users can insert order items"
  on public.order_items for insert with check (auth.uid() is not null);
create policy "Artist full access order items"
  on public.order_items for all using (public.is_artist());

-- ---- COURSE RESERVATIONS ----
create policy "Clients see own reservations"
  on public.course_reservations for select using (client_id = auth.uid());
create policy "Authenticated users can reserve"
  on public.course_reservations for insert with check (auth.uid() is not null);
create policy "Artist sees all reservations"
  on public.course_reservations for select using (public.is_artist());
create policy "Artist can manage reservations"
  on public.course_reservations for all using (public.is_artist());

-- ---- CHAT MESSAGES ----
create policy "Clients see own chat"
  on public.chat_messages for select using (client_id = auth.uid());
create policy "Clients send messages"
  on public.chat_messages for insert with check (client_id = auth.uid() and sender_role = 'client');
create policy "Artist sees all chats"
  on public.chat_messages for select using (public.is_artist());
create policy "Artist sends messages"
  on public.chat_messages for insert with check (public.is_artist());
create policy "Artist can update chat messages"
  on public.chat_messages for update using (public.is_artist());
create policy "Clients can update own chat read status"
  on public.chat_messages for update using (client_id = auth.uid());

-- ---- REMINDERS ----
create policy "Artist full access reminders"
  on public.reminders for all using (public.is_artist());

-- ---- CONTACT SUBMISSIONS ----
create policy "Anyone can submit contact"
  on public.contact_submissions for insert with check (true);
create policy "Artist views contact submissions"
  on public.contact_submissions for select using (public.is_artist());

-- ============================================================
-- REALTIME: Enable for chat_messages
-- ============================================================
alter publication supabase_realtime add table public.chat_messages;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_appointments_client   on public.appointments(client_id);
create index if not exists idx_appointments_date     on public.appointments(date);
create index if not exists idx_chat_messages_client  on public.chat_messages(client_id);
create index if not exists idx_chat_messages_created on public.chat_messages(created_at);
create index if not exists idx_orders_client         on public.orders(client_id);
create index if not exists idx_portfolio_sort        on public.portfolio_items(sort_order);
create index if not exists idx_shop_category         on public.shop_items(category);
create index if not exists idx_course_res_course     on public.course_reservations(course_id);
