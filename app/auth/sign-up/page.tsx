import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#080810] px-6 pb-10 pt-24 text-white md:px-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full bg-blue-700/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-60 h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-sky-700/8 blur-[100px]" />
      </div>
      <div className="relative z-10 flex min-h-[calc(100vh-8.5rem)] w-full items-center justify-center">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
