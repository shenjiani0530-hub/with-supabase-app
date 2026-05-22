import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#080810] px-6 pb-10 pt-24 text-white md:px-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full bg-blue-700/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-60 h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-sky-700/8 blur-[100px]" />
      </div>
      <div className="relative z-10 flex min-h-[calc(100vh-8.5rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className="border-white/[0.08] bg-white/[0.04] text-white shadow-2xl shadow-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">感谢注册！</CardTitle>
                <CardDescription className="text-white/35">
                  请查收邮件完成验证
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/35">
                  你已成功注册。请查收邮件中的验证链接以确认账户，之后即可登录。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
