import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BriefcaseBusiness, CalendarDays, Check, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RouterOutputs } from "@/providers/trpc";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatRideDate, formatRideTime, formatYen, initials } from "@/lib/format";
import { LUGGAGE_LABELS } from "@contracts/locations";

type Ride = RouterOutputs["rides"]["list"][number];

type Props = {
  ride: Ride | null;
  bookingStatus?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RideDetailsDialog({ ride, bookingStatus, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [note, setNote] = useState("");
  const utils = trpc.useUtils();
  const requestSeat = trpc.rides.requestSeat.useMutation({
    onSuccess: async () => {
      toast.success("Seat request sent", { description: "The driver can now review your request." });
      setNote("");
      await Promise.all([utils.rides.list.invalidate(), utils.rides.myBookings.invalidate()]);
      onOpenChange(false);
    },
    onError: (error) => toast.error("Could not send request", { description: error.message }),
  });

  useEffect(() => setNote(""), [ride?.id]);
  if (!ride) return null;

  const isOwner = user?.id === ride.driverId;
  const hasActiveBooking = bookingStatus === "requested" || bookingStatus === "approved";
  const isClosed = ride.status !== "open" || ride.seatsAvailable < 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto rounded-[28px] border-[#54453f]/15 bg-[#fbfbf8] p-0 text-[#54453f] sm:max-w-xl">
        <div className="bg-[#bbe9f2]/65 px-6 pb-6 pt-8 sm:px-8">
          <DialogHeader className="text-left">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#54453f]/65">
              <span>{formatRideDate(ride.departureAt)} · {formatRideTime(ride.departureAt)} JST</span>
              {ride.isSample && <span className="rounded-full bg-[#fbfbf8]/75 px-2 py-1">Sample</span>}
            </div>
            <DialogTitle className="text-[28px] font-medium leading-tight tracking-[-0.04em] text-[#54453f] sm:text-[34px]">
              {ride.origin} <span className="text-[#355f2e]">→</span> {ride.destination}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#54453f]/70">
              Review the ride details before sending a seat request.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="grid grid-cols-3 gap-3 border-b border-[#54453f]/12 pb-6">
            <div>
              <UsersRound size={18} className="mb-2 text-[#355f2e]" />
              <p className="text-sm font-bold">{ride.seatsAvailable} seats left</p>
              <p className="mt-0.5 text-xs text-[#54453f]/55">of {ride.seatsTotal} offered</p>
            </div>
            <div>
              <BriefcaseBusiness size={18} className="mb-2 text-[#355f2e]" />
              <p className="text-sm font-bold">{LUGGAGE_LABELS[ride.luggage]}</p>
              <p className="mt-0.5 text-xs text-[#54453f]/55">luggage</p>
            </div>
            <div>
              <CalendarDays size={18} className="mb-2 text-[#355f2e]" />
              <p className="text-sm font-bold">{formatYen(ride.contributionYen)}</p>
              <p className="mt-0.5 text-xs text-[#54453f]/55">shared cost / seat</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#54453f]/12 py-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffd3e0] text-sm font-extrabold">
              {initials(ride.driverName)}
            </span>
            <div>
              <p className="font-bold">{ride.driverName || "Nori student"}</p>
              <p className="text-sm text-[#54453f]/60">{ride.driverUniversity || ride.university || "Student driver"}</p>
            </div>
          </div>

          <div className="py-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#54453f]/55">Driver’s note</h3>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-[#54453f]/80">
              {ride.notes || "No extra notes. Confirm the exact meeting point with the driver before departure."}
            </p>
          </div>

          <div className="flex gap-3 bg-[#c9e7b5]/30 p-4 text-xs leading-5 text-[#54453f]/75">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#355f2e]" size={18} />
            <p>Requests need driver approval. Nori does not handle payments; agree on actual shared costs and the meeting point before traveling.</p>
          </div>

          {hasActiveBooking ? (
            <div className="mt-6 flex items-center gap-3 border-t border-[#54453f]/12 pt-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9e7b5]"><Check size={19} /></span>
              <div>
                <p className="font-bold">{bookingStatus === "approved" ? "Your seat is approved" : "Your request is pending"}</p>
                <p className="text-sm text-[#54453f]/60">Manage it from My trips.</p>
              </div>
            </div>
          ) : isOwner ? (
            <p className="mt-6 border-t border-[#54453f]/12 pt-6 text-sm font-semibold text-[#54453f]/65">This is your ride. Manage requests from My trips.</p>
          ) : isClosed ? (
            <p className="mt-6 border-t border-[#54453f]/12 pt-6 text-sm font-semibold text-[#54453f]/65">This ride is no longer accepting seat requests.</p>
          ) : isAuthenticated ? (
            <form
              className="mt-6 border-t border-[#54453f]/12 pt-6"
              onSubmit={(event) => {
                event.preventDefault();
                requestSeat.mutate({ rideId: ride.id, note: note.trim() || undefined });
              }}
            >
              <label className="grid gap-2 text-sm font-bold" htmlFor="request-note">
                Note to the driver <span className="font-normal text-[#54453f]/55">(optional)</span>
                <textarea
                  id="request-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="Your campus, meeting point, or luggage details"
                  className="w-full resize-none rounded-2xl border border-[#54453f]/20 bg-transparent p-3 text-base font-normal outline-none transition-colors placeholder:text-[#54453f]/40 focus:border-[#4ba53a]"
                />
              </label>
              <button
                type="submit"
                disabled={requestSeat.isPending}
                className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#355f2e] px-6 text-sm font-bold text-[#fbfbf8] transition-all hover:bg-[#2b5026] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {requestSeat.isPending ? "Sending request…" : "Request a seat"}
              </button>
            </form>
          ) : (
            <div className="mt-6 border-t border-[#54453f]/12 pt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#355f2e] px-6 text-sm font-bold text-[#fbfbf8] transition-all hover:bg-[#2b5026]"
              >
                Sign in to request a seat
              </button>
              <p className="mt-3 text-center text-xs text-[#54453f]/55">Your ride searches remain available without an account.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
