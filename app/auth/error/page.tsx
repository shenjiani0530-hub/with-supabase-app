import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-white/35">
          错误代码: {params.error}
        </p>
      ) : (
        <p className="text-sm text-white/35">
          发生了一个未指定的错误。
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
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
                <CardTitle className="text-2xl">
                  抱歉，发生了错误。
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense>
                  <ErrorContent searchParams={searchParams} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
