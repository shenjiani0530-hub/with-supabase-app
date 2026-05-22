import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4 text-white/80">
      你好，{user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant="outline"
        className="border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
      >
        <Link href="/auth/login">登录</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="bg-blue-500 hover:bg-blue-400 text-white"
      >
        <Link href="/auth/sign-up">注册</Link>
      </Button>
    </div>
  );
}
