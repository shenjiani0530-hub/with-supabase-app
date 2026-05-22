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

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      // router.push("/protected");
      router.push('/')
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
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription className="text-white/35">
            输入邮箱和密码登录你的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-blue-300 underline-offset-4 hover:text-blue-200 hover:underline">
                    忘记密码？
                  </Link>
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:from-blue-400 hover:to-blue-500"
                disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-white/35">
              还没有账户？{' '}
              <Link
                href="/auth/sign-up"
                className="text-blue-300 underline underline-offset-4 hover:text-blue-200">
                去注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
