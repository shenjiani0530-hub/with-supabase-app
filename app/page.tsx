"use client"

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Check,
  Trash2,
  Sparkles,
  Flame,
  AlertCircle,
  Leaf,
  ListTodo,
  Filter,
  RotateCcw,
  Image,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logout } from './actions'

type Priority = 'low' | 'medium' | 'high'
type FilterType = 'all' | 'active' | 'completed'
type Todo = {
  id: string
  text: string
  priority: Priority
  completed: boolean
  image_url?: string | null
  created_at: string
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: '全部',
  active: '进行中',
  completed: '已完成',
}

const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string
    color: string
    bg: string
    border: string
    icon: React.ReactNode
  }
> = {
  high: {
    label: '高',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: <Flame size={12} />,
  },
  medium: {
    label: '中',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: <AlertCircle size={12} />,
  },
  low: {
    label: '低',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: <Leaf size={12} />,
  },
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null)
      setUserId(data.session?.user?.id ?? null)
    })
    fetchTodos()
  }, [])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel('todos-realtime')
      .on<Todo>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((prev) =>
              prev.some((t) => t.id === payload.new.id)
                ? prev
                : [payload.new as Todo, ...prev],
            )
          } else if (payload.eventType === 'UPDATE') {
            setTodos((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Todo) : t,
              ),
            )
          } else if (payload.eventType === 'DELETE') {
            setTodos((prev) =>
              prev.filter((t) => t.id !== payload.old.id),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function handleLogout() {
    await logout()
    setUserEmail(null)
    router.refresh()
  }

  async function fetchTodos() {
    const supabase = createClient()
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTodos(data as Todo[])
    setLoading(false)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function addTodo() {
    const text = input.trim()
    if ((!text && !imageFile) || adding) return
    if (!userEmail) {
      router.push('/auth/login')
      return
    }
    setAdding(true)

    const supabase = createClient()

    let imageUrl: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('todo')
        .upload(filePath, imageFile)
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('todo')
          .getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    const res = await fetch('/api/todos/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, accessToken, imageUrl }),
    })

    const json = await res.json()
    if (json.todos?.length) {
      setTodos((prev) => [...(json.todos as Todo[]), ...prev])
      setInput('')
      clearImage()
    }
    setAdding(false)
    inputRef.current?.focus()
  }

  async function toggleTodo(id: string, completed: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)
    if (!error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)),
      )
    }
  }

  async function deleteTodo(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('todos').delete().eq('id', id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
    setDeletingId(null)
  }

  async function clearCompleted() {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id)
    if (!completedIds.length) return
    const supabase = createClient()
    await supabase.from('todos').delete().in('id', completedIds)
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length
  const progressPct =
    todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] bg-blue-700/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] bg-sky-700/8 rounded-full blur-[100px]" />
        {/* grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pb-14 pt-24">
        <div className="mb-8 flex items-center justify-center gap-3">
          {userEmail ? (
            <>
              <span className="text-xs text-white/40">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition-all hover:border-blue-400/50 hover:bg-blue-500/20 hover:text-white"
              >
                登录
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/35"
              >
                注册
              </Link>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-widest uppercase">
            <Sparkles size={11} />
            任务管理器
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none bg-gradient-to-br from-white via-white/80 to-white/30 bg-clip-text text-transparent">
            我的任务
          </h1>

          {/* Progress bar */}
          {todos.length > 0 && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-white/30 mb-1.5">
                <span>已完成 {completedCount} 项</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input card */}
        <div className="mb-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入文本或上传图片，AI 将自动识别其中的待办事项..."
              rows={3}
              className="flex-1 bg-white/[0.05] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 resize-none"
            />
            <button
              onClick={addTodo}
              disabled={(!input.trim() && !imageFile) || adding}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 active:scale-95">
              {adding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              <span className="hidden sm:inline">添加</span>
            </button>
          </div>

          {/* Priority selector */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-white/25 text-xs font-medium shrink-0">
              优先级
            </span>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const isActive = priority === p
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 active:scale-95 ${
                      isActive
                        ? `${cfg.bg} ${cfg.border} ${cfg.color} shadow-sm`
                        : 'bg-transparent border-white/[0.06] text-white/25 hover:text-white/50 hover:border-white/20'
                    }`}>
                    {cfg.icon}
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <div className="ml-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 active:scale-95 ${
                  imageFile
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-transparent border-white/[0.06] text-white/25 hover:text-white/50 hover:border-white/20'
                }`}>
                <Image size={12} />
                图片
              </button>
            </div>
          </div>
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="h-20 w-20 rounded-xl border border-white/[0.08] object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white transition-colors hover:bg-red-500">
                <X size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
            <Filter size={11} className="text-white/15 ml-1.5" />
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 ${
                  filter === f
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/25 hover:text-white/50'
                }`}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="flex items-center gap-1.5 text-xs text-white/25 hover:text-red-400 transition-colors duration-150">
              <RotateCcw size={11} />
              清除 {completedCount} 项已完成
            </button>
          )}
        </div>

        {/* Todo list */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <ListTodo size={30} className="text-white/15" />
              </div>
              <p className="text-white/20 text-sm">
                {filter === 'completed'
                  ? '还没有已完成的任务'
                  : filter === 'active'
                    ? '没有进行中的任务'
                    : userEmail ? '还没有任务，先添加一项吧！' : '登录后即可制定 Todo'}
              </p>
            </div>
          ) : (
            filtered.map((todo) => {
              const cfg = PRIORITY_CONFIG[todo.priority as Priority]
              const isDeleting = deletingId === todo.id
              return (
                <div
                  key={todo.id}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
                    isDeleting ? 'opacity-0 scale-95' : ''
                  } ${
                    todo.completed
                      ? 'bg-white/[0.02] border-white/[0.05]'
                      : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/20'
                  }`}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                      todo.completed
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-transparent shadow-md shadow-blue-500/30'
                        : 'border-white/15 hover:border-blue-400/60 hover:bg-blue-500/10'
                    }`}>
                    {todo.completed && (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    )}
                  </button>

                  {/* Text */}
                  <span
                    className={`flex-1 text-sm leading-relaxed transition-all duration-200 ${
                      todo.completed
                        ? 'line-through text-white/25'
                        : 'text-white/80'
                    }`}>
                    {todo.text}
                  </span>

                  {todo.image_url && (
                    <a
                      href={todo.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-shrink-0"
                    >
                      <img
                        src={todo.image_url}
                        alt="attachment"
                        className="h-8 w-8 rounded-lg border border-white/[0.08] object-cover transition-opacity hover:opacity-80"
                      />
                    </a>
                  )}

                  {/* Priority badge */}
                  <span
                    className={`flex-shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    disabled={isDeleting}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-all duration-150 active:scale-90">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer stats */}
        {todos.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/15">
            <span>共 {todos.length} 项</span>
            <span className="w-px h-3 bg-white/[0.08]" />
            <span className="text-blue-400/50">进行中 {activeCount} 项</span>
            <span className="w-px h-3 bg-white/[0.08]" />
            <span className="text-emerald-400/50">已完成 {completedCount} 项</span>
          </div>
        )}
      </div>
    </div>
  )
}
