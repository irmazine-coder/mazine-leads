-- Execute este arquivo no SQL Editor do Supabase.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  business_name text not null,
  category text default 'Moda feminina',
  city text default 'Campo Grande',
  state text default 'MS',
  instagram_url text,
  website_url text,
  phone text,
  whatsapp text,
  address text,
  source text,
  notes text,
  status text not null default 'descoberta'
    check (status in ('descoberta','cadastrado','analisado','oportunidade','abordagem','acompanhamento','negociacao','cliente','descartado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_user_id_idx on public.leads(user_id);
create index if not exists leads_status_idx on public.leads(status);
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists update_leads_updated_at on public.leads;
create trigger update_leads_updated_at before update on public.leads
for each row execute function public.set_updated_at();
alter table public.leads enable row level security;
drop policy if exists "Ver próprios leads" on public.leads;
create policy "Ver próprios leads" on public.leads for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Cadastrar próprios leads" on public.leads;
create policy "Cadastrar próprios leads" on public.leads for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Editar próprios leads" on public.leads;
create policy "Editar próprios leads" on public.leads for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Excluir próprios leads" on public.leads;
create policy "Excluir próprios leads" on public.leads for delete to authenticated using (auth.uid() = user_id);
