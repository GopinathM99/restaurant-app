-- Create extension required for UUID generation (enabled by default on new Supabase projects)
create extension if not exists "pgcrypto";

create table if not exists public.menu_items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price_cents integer not null check (price_cents >= 0),
    category text,
    image_url text,
    is_featured boolean not null default false,
    display_order integer,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.menu_items;
create trigger set_timestamp
before update on public.menu_items
for each row
execute procedure public.trigger_set_timestamp();

-- Row Level Security
alter table public.menu_items enable row level security;

drop policy if exists "Allow read access to menu" on public.menu_items;
create policy "Allow read access to menu"
    on public.menu_items
    for select
    using (true);

-- Example write policy for authenticated staff role (adjust as needed)
drop policy if exists "Allow staff to manage menu" on public.menu_items;
create policy "Allow staff to manage menu"
    on public.menu_items
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- Sample data
insert into public.menu_items (name, description, price_cents, category, image_url, is_featured, display_order)
values
    ('Royal Hyderabadi Biryani', 'Aromatic basmati rice layered with tender marinated meat, saffron, and caramelized onions.', 48000, 'Mains', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80', true, 1),
    ('Paneer Tikka Platter', 'Char-grilled cottage cheese infused with yogurt, spices, and a hint of smoked mustard.', 36000, 'Starters', 'https://images.unsplash.com/photo-1604908176997-12518821a193?auto=format&fit=crop&w=1000&q=80', true, 2),
    ('Malabar Prawn Curry', 'Creamy coconut curry simmered with tiger prawns, tempered with curry leaves and mustard seeds.', 52000, 'Mains', 'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=1000&q=80', true, 3),
    ('Chettinad Pepper Chicken', 'Fiery black pepper gravy slow-cooked with succulent chicken and roasted spices.', 44000, 'Mains', 'https://images.unsplash.com/photo-1598373182133-52452a1d4a43?auto=format&fit=crop&w=1000&q=80', false, 4),
    ('Delhi Street Chaat', 'Tangy tamarind chutney, yogurt, and crispy papdi topped with sev and pomegranate pearls.', 22000, 'Snacks', 'https://images.unsplash.com/photo-1601493700631-2b89b273b1f1?auto=format&fit=crop&w=1000&q=80', false, 5),
    ('Masala Dosa Supreme', 'Golden dosa filled with spiced potato masala, served with coconut and tomato chutneys.', 26000, 'Mains', 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1000&q=80', false, 6)
on conflict (id) do nothing;
