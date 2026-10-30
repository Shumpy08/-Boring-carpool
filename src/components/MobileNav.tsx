import { NavLink } from "react-router";
import { CarFront, Search, UserRound } from "lucide-react";

const items = [
  { to: "/", label: "Find", icon: Search },
  { to: "/offer", label: "Offer", icon: CarFront },
  { to: "/trips", label: "My trips", icon: UserRound },
];

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#54453f]/15 bg-[#fbfbf8]/95 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition-colors ${
                isActive ? "text-[#355f2e]" : "text-[#54453f]/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${isActive ? "bg-[#c9e7b5]" : ""}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
