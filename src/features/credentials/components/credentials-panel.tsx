"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/shared/i18n/routing";
import {
  Boxes,
  Bot,
  CheckCircle2,
  Edit2,
  FlaskConical,
  Folder,
  Globe,
  Key,
  KeyRound,
  List,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  Send,
  Shield,
  Sparkles,
  Table,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/common/empty-state";
import type { Credential, CredentialListResponse, CredentialType } from "@/shared/types/api";
import {
  deleteCredentialAction,
  listCredentialsAction,
  testCredentialAction,
} from "../actions";
import { CredentialForm } from "./credential-form";

// ---------------------------------------------------------------------------
// Icon map — per-type icons (mirrors detail page)
// ---------------------------------------------------------------------------
type LucideIconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, LucideIconComponent> = {
  key: Key,
  shield: Shield,
  mail: Mail,
  table: Table,
  folder: Folder,
  send: Send,
  user: User,
  globe: Globe,
  list: List,
  bot: Bot,
  sparkles: Sparkles,
  boxes: Boxes,
};

function getTypeIcon(iconName: string | undefined): LucideIconComponent {
  if (!iconName) return Key;
  return ICON_MAP[iconName] ?? Key;
}

/** Mask a string like "sk-abc123..." → "sk-ab••••••••" */
function maskValue(val: string | undefined | null): string {
  if (!val) return "••••••••••••";
  if (val.length <= 6) return "••••••••••••";
  return val.slice(0, 6) + "••••••••";
}

// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

interface CredentialsPanelProps {
  initialData: CredentialListResponse;
  types: CredentialType[];
}

export function CredentialsPanel({ initialData, types }: CredentialsPanelProps) {
  const [data, setData] = useState<CredentialListResponse>(initialData);
  const [filterType, setFilterType] = useState<string>("__all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Credential | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Credential | null>(null);
  const [deleting, startDelete] = useTransition();

  // Test state: track per-credential test result
  const [testResult, setTestResult] = useState<Record<string | number, boolean | null>>({});
  const [testing, setTesting] = useState<Record<string | number, boolean>>({});

  const reload = useCallback(
    async (p = page, typeKey = filterType) => {
      setLoading(true);
      try {
        const params: { type_key?: string; page: number; page_size: number } = {
          page: p,
          page_size: PAGE_SIZE,
        };
        if (typeKey !== "__all") params.type_key = typeKey;
        const result = await listCredentialsAction(params);
        setData(result);
      } catch {
        toast.error("Yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    },
    [page, filterType]
  );

  // Re-fetch when filter or page changes
  useEffect(() => {
    reload(page, filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, page]);

  const handleFilterChange = (val: string) => {
    setFilterType(val);
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      const res = await deleteCredentialAction(deleteTarget.id);
      if (res.ok) {
        toast.success("O'chirildi");
        setDeleteTarget(null);
        reload(page, filterType);
      } else {
        toast.error(res.message ?? "O'chirishda xatolik");
      }
    });
  };

  const handleTest = async (cred: Credential) => {
    setTesting((prev) => ({ ...prev, [cred.id]: true }));
    try {
      const res = await testCredentialAction(cred.id);
      setTestResult((prev) => ({ ...prev, [cred.id]: res.ok }));
      if (res.ok) {
        toast.success("Ulanish muvaffaqiyatli");
      } else {
        toast.error(res.message ?? "Ulanish xato");
      }
    } finally {
      setTesting((prev) => ({ ...prev, [cred.id]: false }));
    }
  };

  const credentials = data.results;
  const totalPages = data.total_pages;

  return (
    <div className="px-8 py-7 max-w-[860px]">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-[27px] font-semibold tracking-[-0.6px] leading-none mb-1.5"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Credentials
          </h1>
          <p className="text-sm text-muted-foreground">
            API kalitlar va integratsiyalar — shifrlangan saqlanadi
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-[17px] py-[11px] rounded-[10px] text-[14px] font-semibold text-white cursor-pointer border-0 transition-[filter] hover:brightness-110"
          style={{
            background: "linear-gradient(150deg, var(--primary), #2563eb)",
          }}
        >
          <Plus className="h-[18px] w-[18px]" />
          Yangi kalit
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filter                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-5">
        <Select value={filterType} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Barcha turlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Barcha turlar</SelectItem>
            {types.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* List                                                                 */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : credentials.length === 0 ? (
        <EmptyState
          icon={<KeyRound className="h-7 w-7" />}
          title="Credential yo'q"
          description="API key, token yoki autentifikatsiya ma'lumotlarini saqlang"
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-[17px] py-[11px] rounded-[10px] text-[14px] font-semibold text-white cursor-pointer border-0 transition-[filter] hover:brightness-110"
              style={{
                background: "linear-gradient(150deg, var(--primary), #2563eb)",
              }}
            >
              <Plus className="h-[18px] w-[18px]" />
              Yangi kalit
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {credentials.map((cred) => {
            const testRes = testResult[cred.id];
            const isTesting = testing[cred.id] ?? false;
            const credTypeDef = types.find((t) => t.key === cred.type_key);
            const TypeIcon = getTypeIcon(credTypeDef?.icon);
            const typeColor = credTypeDef?.color;

            return (
              <div
                key={cred.id}
                className="flex items-center gap-[15px] rounded-[13px] px-[18px] py-4 border transition-colors"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-[11px] flex items-center justify-center shrink-0 text-white"
                  style={
                    typeColor
                      ? { backgroundColor: typeColor, color: "#fff" }
                      : {
                          background: "linear-gradient(150deg, var(--primary), #2563eb)",
                        }
                  }
                >
                  <TypeIcon className="h-[19px] w-[19px]" />
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/app/credentials/${cred.id}`}
                    className="block font-semibold text-[14.5px] hover:underline underline-offset-2 truncate"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {cred.name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {cred.type.label}
                    {cred.updated_at && (
                      <>
                        {" "}
                        &bull;{" "}
                        {new Date(cred.updated_at).toLocaleDateString("uz-UZ")}
                      </>
                    )}
                  </div>
                </div>

                {/* Masked value */}
                <span className="font-mono text-[13px] text-muted-foreground tracking-[1px] shrink-0 hidden sm:block">
                  {maskValue(undefined)}
                </span>

                {/* Test result indicator */}
                {testRes === true && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                {testRes === false && (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                )}

                {/* Actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] border-0 bg-transparent text-muted-foreground cursor-pointer transition-colors hover:bg-white/[0.06] hover:text-foreground shrink-0"
                      aria-label="Amallar"
                    >
                      <MoreHorizontal className="h-[17px] w-[17px]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => handleTest(cred)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FlaskConical className="mr-2 h-3.5 w-3.5" />
                      )}
                      Test
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditTarget(cred)}>
                      <Edit2 className="mr-2 h-3.5 w-3.5" />
                      Tahrirlash
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(cred)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      O&apos;chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                           */}
      {/* ------------------------------------------------------------------ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Oldingi
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Create dialog                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yangi credential</DialogTitle>
            <DialogDescription>
              API kalitlar, tokenlar va autentifikatsiya ma&apos;lumotlarini xavfsiz saqlang
            </DialogDescription>
          </DialogHeader>
          <CredentialForm
            types={types}
            onSuccess={() => {
              setCreateOpen(false);
              reload(page, filterType);
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Edit dialog                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={Boolean(editTarget)} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Credential tahrirlash</DialogTitle>
            <DialogDescription>
              Nomni yoki ma&apos;lumotlarni yangilang
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <CredentialForm
              types={types}
              credential={editTarget}
              onSuccess={() => {
                setEditTarget(null);
                reload(page, filterType);
              }}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Delete confirm dialog                                                */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>O&apos;chirish tasdiqlash</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.name}</strong> credentialini o&apos;chirasizmi? Bu amalni
              qaytarib bo&apos;lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              O&apos;chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
