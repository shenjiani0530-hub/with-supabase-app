-- 创建 todos 表
create table if not exists public.todos (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  completed boolean not null default false,
  image_url text,
  created_at timestamptz not null default now()
);

-- 插入时自动将 user_id 设为当前用户
create or replace function public.handle_new_todo()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

create trigger set_todo_user_id
  before insert on public.todos
  for each row
  execute function public.handle_new_todo();

-- 启用 RLS
alter table public.todos enable row level security;

-- 已登录用户可查看自己的所有 Todo
create policy "用户只能查看自己的 Todo"
  on public.todos
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 已登录用户可创建自己的 Todo（user_id 由触发器自动填充）
create policy "用户只能创建自己的 Todo"
  on public.todos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 已登录用户可更新自己的 Todo
create policy "用户只能更新自己的 Todo"
  on public.todos
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 已登录用户可删除自己的 Todo
create policy "用户只能删除自己的 Todo"
  on public.todos
  for delete
  to authenticated
  using (auth.uid() = user_id);
