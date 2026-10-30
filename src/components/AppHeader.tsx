import { Link, NavLink } from "react-router";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/format";

const navItems = [
  { to: "/", label: "Find a ride" },
  { to: "/offer", label: "Offer a ride" },
  { to: "/trips", label: "My trips" },
];

export function Brand() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Nori home">
      <span className="relative text-[30px] font-extrabold leading-none tracking-[-0.075em] text-[#54453f]">
        nori
        <span className="absolute -right-2.5 top-0.5 h-2 w-2 rounded-full bg-[#4ba53a]" />
      </span>
      <span className="hidden border-l border-[#54453f]/20 pl-2.5 text-[11px] font-semibold leading-tight tracking-wide text-[#54453f]/65 sm:block">
        Niigata student<br />carpool
      </span>
    </Link>
  );
}

export default function AppHeader() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[#54453f]/10 bg-[#fbfbf8]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center text-sm font-semibold transition-colors duration-200 after:absolute after:bottom-1 after:left-0 after:h-0.5 after:bg-[#4ba53a] after:transition-all after:duration-200 ${
                  isActive ? "text-[#355f2e] after:w-full" : "text-[#54453f]/70 after:w-0 hover:text-[#355f2e] hover:after:w-full"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/safety"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-[#54453f]/65 transition-colors hover:bg-[#c9e7b5]/45 hover:text-[#355f2e] sm:flex"
            aria-label="Safety and community guidelines"
          >
            <ShieldCheck size={19} />
          </Link>
          {isAuthenticated && user ? (
            <>
              <Link
                to="/trips"
                className="flex h-11 items-center gap-2 rounded-full border border-[#54453f]/20 px-2 pr-3 text-sm font-semibold transition-colors hover:border-[#4ba53a] hover:bg-[#c9e7b5]/30"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bbe9f2] text-xs font-bold text-[#54453f]">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-24 truncate sm:block">{user.name || "Account"}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                disabled={isLoading}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[#54453f]/60 transition-colors hover:bg-[#ffd3e0]/50 hover:text-[#54453f] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#54453f]/25 px-4 text-sm font-bold text-[#54453f] transition-all hover:border-[#4ba53a] hover:bg-[#c9e7b5]/30"
            >
              <UserRound size={17} />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
