import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
};

export default function ConfirmAction({ trigger, title, description, confirmLabel, onConfirm, pending }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-[24px] border-[#54453f]/15 bg-[#fbfbf8] text-[#54453f]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-medium tracking-tight">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-[#54453f]/65">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 rounded-full border-[#54453f]/20 bg-transparent">Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className="h-11 rounded-full bg-[#355f2e] text-[#fbfbf8] hover:bg-[#2b5026]"
          >
            {pending ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
