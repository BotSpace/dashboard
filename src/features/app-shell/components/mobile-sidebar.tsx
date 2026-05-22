"use client";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { SidebarContent } from "./sidebar";

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-svh w-72 max-w-none translate-x-0 translate-y-0 rounded-none border-r p-0 sm:max-w-none sm:rounded-none">
        <DialogTitle className="sr-only">Menyu</DialogTitle>
        <SidebarContent onNavigate={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
