"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/shared/i18n/routing";
import {
  CheckCircle2,
  Edit2,
  FlaskConical,
  KeyRound,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3">
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

        <div className="ml-auto">
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Yangi credential
          </Button>
        </div>
      </div>

      {/* List */}
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
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Yangi credential
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Tur</th>
                    <th className="px-4 py-3 text-left">Yangilangan</th>
                    <th className="px-4 py-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => {
                    const testRes = testResult[cred.id];
                    const isTesting = testing[cred.id] ?? false;
                    return (
                      <tr
                        key={cred.id}
                        className="border-b last:border-0 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-500/10 text-blue-400">
                              <KeyRound className="h-3.5 w-3.5" />
                            </div>
                            <Link
                              href={`/app/credentials/${cred.id}`}
                              className="font-medium hover:underline underline-offset-2"
                            >
                              {cred.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{cred.type.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {cred.updated_at
                            ? new Date(cred.updated_at).toLocaleDateString("uz-UZ")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* Test result indicator */}
                            {testRes === true && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            {testRes === false && (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              title="Test"
                              onClick={() => handleTest(cred)}
                              disabled={isTesting}
                            >
                              {isTesting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FlaskConical className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Tahrirlash"
                              onClick={() => setEditTarget(cred)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="O'chirish"
                              onClick={() => setDeleteTarget(cred)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      {/* Create dialog */}
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

      {/* Edit dialog */}
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

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>O'chirish tasdiqlash</DialogTitle>
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
    </>
  );
}
