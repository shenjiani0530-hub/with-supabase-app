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
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
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
          <CardTitle className="text-2xl">重置密码</CardTitle>
          <CardDescription className="text-white/35">
            请输入你的新密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white/70">
                  新密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="新密码"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/[0.07] bg-white/[0.05] text-white placeholder:text-white/20 focus-visible:ring-blue-500/40"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:from-blue-400 hover:to-blue-500"
                disabled={isLoading}>
                {isLoading ? '保存中...' : '保存新密码'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
