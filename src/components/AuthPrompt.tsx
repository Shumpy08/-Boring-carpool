import { Link } from "react-router";
import { ArrowRight, UserRound } from "lucide-react";

export default function AuthPrompt({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:py-28">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#bbe9f2] text-[#54453f]">
        <UserRound size={28} />
      </span>
      <h1 className="mt-6 text-[36px] font-medium tracking-[-0.04em] text-[#54453f]">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#54453f]/65">{copy}</p>
      <Link to="/login" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#355f2e] px-6 text-sm font-bold text-[#fbfbf8] transition-colors hover:bg-[#2b5026]">
        Sign in to continue <ArrowRight size={17} />
      </Link>
      <p className="mt-4 text-xs text-[#54453f]/50">You can keep browsing rides without signing in.</p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#355f2e] underline underline-offset-4">Back to ride search</Link>
    </div>
  );
}
