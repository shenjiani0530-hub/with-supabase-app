"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-white/[0.08] bg-white/[0.04] text-white shadow-2xl shadow-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">请查收邮件</CardTitle>
            <CardDescription className="text-white/35">
              密码重置链接已发送
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/35">
              如果你使用邮箱和密码注册，将会收到一封包含密码重置链接的邮件。
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/[0.08] bg-white/[0.04] text-white shadow-2xl shadow-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">重置密码</CardTitle>
            <CardDescription className="text-white/35">
              输入邮箱地址，我们会发送密码重置链接
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white/70">邮箱</Label>
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
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:from-blue-400 hover:to-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? "发送中..." : "发送重置邮件"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-white/35">
                已有账户？{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-300 underline underline-offset-4 hover:text-blue-200"
                >
                  去登录
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
