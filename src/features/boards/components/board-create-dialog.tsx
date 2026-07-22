"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/shared/i18n/routing";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createBoardAction } from "../actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { Project } from "@/shared/types/api";

const templates = {
  blank: { label: "Bo‘sh board", card: "Karta", columns: ["Yangi", "Jarayonda", "Bajarildi"] },
  leads: { label: "Sotuv leadlari", card: "Lead", columns: ["Yangi lead", "Bog‘lanildi", "Taklif", "Yutildi"] },
  support: { label: "Mijozlar yordami", card: "Murojaat", columns: ["Yangi", "Ko‘rib chiqilmoqda", "Javob kutilmoqda", "Yopildi"] },
  orders: { label: "Buyurtmalar", card: "Buyurtma", columns: ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yetkazildi"] },
  hiring: { label: "Ishga qabul", card: "Nomzod", columns: ["Yangi", "Suhbat", "Taklif", "Qabul qilindi"] },
  tasks: { label: "Vazifalar", card: "Vazifa", columns: ["Reja", "Jarayonda", "Tekshiruv", "Bajarildi"] },
} as const;

export function BoardCreateDialog({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<keyof typeof templates>("leads");
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (!name.trim()) return;
    const selected = templates[template];
    startTransition(async () => {
      try {
        const board = await createBoardAction({
          name: name.trim(),
          card_type_label: selected.card,
          project_ids: projectIds,
          field_schema: [],
          columns: selected.columns.map((column, index) => ({
            name: column,
            color: ["#64748b", "#3b82f6", "#f59e0b", "#22c55e"][Math.min(index, 3)],
            is_terminal: index === selected.columns.length - 1,
          })),
        });
        setOpen(false);
        router.push(`/app/boards/${board.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Board yaratilmadi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Yangi board</Button></DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Yangi ish boardi</DialogTitle><DialogDescription>Barcha botlar foydalanishi mumkin bo‘lgan jarayon yarating.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="board-name">Nomi</Label><Input id="board-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan, Sotuv jarayoni" /></div>
          <div className="space-y-2"><Label>Shablon</Label><Select value={template} onValueChange={(value) => setTemplate(value as keyof typeof templates)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(templates).map(([key, item]) => <SelectItem key={key} value={key}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          {projects.length > 0 && <div className="space-y-2"><Label>Botlarga bog‘lash</Label><div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">{projects.map((project) => <label key={project.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"><input type="checkbox" checked={projectIds.includes(project.id)} onChange={(e) => setProjectIds((current) => e.target.checked ? [...current, project.id] : current.filter((id) => id !== project.id))} />{project.name}</label>)}</div></div>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button><Button onClick={submit} disabled={pending || !name.trim()}>{pending ? "Yaratilmoqda…" : "Yaratish"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
