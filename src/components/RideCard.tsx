import { ArrowUpRight, BriefcaseBusiness, UsersRound } from "lucide-react";
import type { RouterOutputs } from "@/providers/trpc";
import { formatRideDate, formatRideTime, formatYen, initials } from "@/lib/format";
import { LUGGAGE_LABELS } from "@contracts/locations";

type Ride = RouterOutputs["rides"]["list"][number];

type Props = {
  ride: Ride;
  bookingStatus?: string;
  onSelect: () => void;
};

export default function RideCard({ ride, bookingStatus, onSelect }: Props) {
  const isFull = ride.status === "full" || ride.seatsAvailable < 1;
  const actionLabel = bookingStatus === "approved" ? "Seat approved" : bookingStatus === "requested" ? "Requested" : isFull ? "Full" : "View ride";

  return (
    <article className="ride-enter rounded-[24px] border border-[#54453f]/15 bg-[#fbfbfb] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4ba53a]/55 sm:p-6">
      <div className="grid gap-5 md:grid-cols-[112px_minmax(0,1fr)_150px_auto] md:items-center md:gap-6">
        <div className="flex items-baseline justify-between border-b border-[#54453f]/10 pb-3 md:block md:border-b-0 md:pb-0">
          <div>
            <p className="text-sm font-bold text-[#54453f]">{formatRideDate(ride.departureAt)}</p>
            <p className="mt-0.5 text-[30px] font-medium leading-none tracking-[-0.045em] text-[#54453f]">{formatRideTime(ride.departureAt)}</p>
          </div>
          {ride.isSample && <span className="rounded-full bg-[#bbe9f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#54453f] md:mt-3 md:inline-block">Sample</span>}
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-[12px_minmax(0,1fr)] gap-x-3">
            <div className="flex flex-col items-center pt-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-[3px] border-[#4ba53a]" />
              <span className="h-5 w-px bg-[#54453f]/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffb583]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[#54453f]" title={ride.origin}>{ride.origin}</p>
              <p className="mt-5 truncate text-base font-bold text-[#54453f]" title={ride.destination}>{ride.destination}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#54453f]/65">
            <span className="inline-flex items-center gap-1.5"><UsersRound size={14} />{ride.seatsAvailable} of {ride.seatsTotal} seats left</span>
            <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} />{LUGGAGE_LABELS[ride.luggage]}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[#54453f]/10 pt-4 md:block md:border-t-0 md:pt-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffd3e0] text-xs font-extrabold text-[#54453f]">
            {initials(ride.driverName)}
          </span>
          <div className="min-w-0 md:mt-2">
            <p className="truncate text-sm font-bold text-[#54453f]">{ride.driverName || "Nori student"}</p>
            <p className="truncate text-xs leading-5 text-[#54453f]/60" title={ride.driverUniversity || ride.university || undefined}>
              {ride.driverUniversity || ride.university || "Student driver"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#54453f]/10 pt-4 md:block md:border-t-0 md:pt-0 md:text-right">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-[#54453f]">{formatYen(ride.contributionYen)}</p>
            <p className="text-[11px] text-[#54453f]/55">shared cost / seat</p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            disabled={isFull && !bookingStatus}
            className="mt-0 inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#54453f]/25 px-4 text-sm font-bold text-[#54453f] transition-all duration-200 hover:border-[#4ba53a] hover:bg-[#c9e7b5]/35 disabled:cursor-not-allowed disabled:opacity-45 md:mt-3"
          >
            {actionLabel}
            {!isFull && <ArrowUpRight size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}
