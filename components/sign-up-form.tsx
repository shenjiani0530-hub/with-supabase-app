'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // emailRedirectTo: `${window.location.origin}/protected`,
          emailRedirectTo: `${window.location.origin}`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-white/[0.08] bg-white/[0.04] text-white shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription className="text-white/35">
            创建一个新账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white/70">
                  邮箱
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/[0.07] bg-white/[0.05] text-white placeholder:text-white/20 focus-visible:ring-blue-500/40"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white/70">
                    密码
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/[0.07] bg-white/[0.05] text-white focus-visible:ring-blue-500/40"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password" className="text-white/70">
                    确认密码
                  </Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="border-white/[0.07] bg-white/[0.05] text-white focus-visible:ring-blue-500/40"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:from-blue-400 hover:to-blue-500"
                disabled={isLoading}>
                {isLoading ? '创建账户中...' : '注册'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-white/35">
              已有账户？{' '}
              <Link
                href="/auth/login"
                className="text-blue-300 underline underline-offset-4 hover:text-blue-200">
                去登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
