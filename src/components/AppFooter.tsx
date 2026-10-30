import { Link } from "react-router";
import { Brand } from "./AppHeader";

export default function AppFooter() {
  return (
    <footer className="border-t border-[#54453f]/15 bg-[#f5f5f0] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Brand />
          <p className="mt-4 max-w-md text-sm leading-6 text-[#54453f]/65">
            Student rides across Niigata, built around campuses, stations, and shared travel costs.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#54453f]/75">
          <Link className="flex min-h-11 items-center hover:text-[#355f2e]" to="/">Find rides</Link>
          <Link className="flex min-h-11 items-center hover:text-[#355f2e]" to="/offer">Offer a ride</Link>
          <Link className="flex min-h-11 items-center hover:text-[#355f2e]" to="/safety">Safety & guidelines</Link>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-[#54453f]/10 pt-5 text-xs leading-5 text-[#54453f]/55">
        Nori does not process payments, verify student status, or provide commercial transport. Starter rides are marked “Sample.”
      </div>
    </footer>
  );
}
