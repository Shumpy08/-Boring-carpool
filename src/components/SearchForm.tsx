import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Search } from "lucide-react";
import { POPULAR_PLACES } from "@contracts/locations";
import { todayInJapan } from "@/lib/format";

export type RideFilters = {
  origin?: string;
  destination?: string;
  date?: string;
};

type Props = {
  initialFilters: RideFilters;
  onSearch: (filters: RideFilters) => void;
};

export default function SearchForm({ initialFilters, onSearch }: Props) {
  const [origin, setOrigin] = useState(initialFilters.origin || "");
  const [destination, setDestination] = useState(initialFilters.destination || "");
  const [date, setDate] = useState(initialFilters.date || "");

  useEffect(() => {
    setOrigin(initialFilters.origin || "");
    setDestination(initialFilters.destination || "");
    setDate(initialFilters.date || "");
  }, [initialFilters]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    onSearch({
      origin: origin.trim() || undefined,
      destination: destination.trim() || undefined,
      date: date || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="border-y border-[#54453f]/20 py-2" aria-label="Search rides">
      <div className="grid md:grid-cols-[1fr_auto_1fr_auto] md:items-center md:gap-3">
        <label className="flex min-h-[68px] items-center gap-3 px-1">
          <MapPin className="shrink-0 text-[#4ba53a]" size={20} />
          <span className="grid flex-1 gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#54453f]/55">From</span>
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              list="popular-places"
              placeholder="Campus or station"
              className="h-8 w-full bg-transparent text-base font-semibold text-[#54453f] outline-none placeholder:font-normal placeholder:text-[#54453f]/45"
            />
          </span>
        </label>
        <ArrowRight className="mx-auto hidden text-[#54453f]/35 md:block" size={18} />
        <label className="flex min-h-[68px] items-center gap-3 border-t border-[#54453f]/10 px-1 md:border-t-0">
          <MapPin className="shrink-0 text-[#e59703]" size={20} />
          <span className="grid flex-1 gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#54453f]/55">To</span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              list="popular-places"
              placeholder="Anywhere in Niigata"
              className="h-8 w-full bg-transparent text-base font-semibold text-[#54453f] outline-none placeholder:font-normal placeholder:text-[#54453f]/45"
            />
          </span>
        </label>
        <div className="flex items-center gap-2 border-t border-[#54453f]/10 pt-2 md:border-t-0 md:pt-0">
          <label className="flex min-h-[60px] min-w-0 flex-1 items-center gap-2 px-1 md:w-[142px] md:flex-none">
            <CalendarDays className="shrink-0 text-[#54453f]/60" size={19} />
            <span className="grid gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#54453f]/55">Date</span>
              <input
                type="date"
                min={todayInJapan()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-8 w-full bg-transparent text-sm font-semibold text-[#54453f] outline-none"
              />
            </span>
          </label>
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#355f2e] px-5 text-sm font-bold text-[#fbfbf8] transition-all duration-200 hover:bg-[#2b5026] active:scale-[0.98] disabled:opacity-50"
          >
            <Search size={17} />
            Search
          </button>
        </div>
      </div>
      <datalist id="popular-places">
        {POPULAR_PLACES.map((place) => <option key={place} value={place} />)}
      </datalist>
    </form>
  );
}
