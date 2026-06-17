"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateCredentialAction } from "@/features/credentials/actions";

interface EditableCredentialNameProps {
  id: string | number;
  initialName: string;
}

export function EditableCredentialName({ id, initialName }: EditableCredentialNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const startEditing = () => {
    setValue(initialName);
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const commit = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialName) {
      setEditing(false);
      setValue(initialName);
      return;
    }
    startTransition(async () => {
      const result = await updateCredentialAction(id, { name: trimmed });
      if (result.ok) {
        toast.success("Nom yangilandi");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.message ?? "Saqlashda xatolik");
        setValue(initialName);
        setEditing(false);
      }
    });
  };

  const cancel = () => {
    setValue(initialName);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            cancel();
          }
        }}
        disabled={pending}
        className="truncate text-2xl font-semibold tracking-tight bg-transparent border-b border-border outline-none w-full min-w-0 disabled:opacity-60"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="group inline-flex items-center gap-1.5 min-w-0 text-left"
    >
      <span className="truncate text-2xl font-semibold tracking-tight">{initialName}</span>
      <Pencil className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
