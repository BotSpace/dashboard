"use client";
import { useEffect, useState, useTransition } from "react";
import { HelpCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ClarifyPayload } from "../types";
import { clarifyRunAction } from "../actions";

type Props = {
  projectId: string;
  requestId: string;
  payload: ClarifyPayload | null;
};

/**
 * Inline chat-card that appears in the message stream when the agent pauses
 * to ask the user for information. Renders the correct widget per input_type:
 *   text        → textarea + Submit
 *   select      → radio list (single choice) + Submit
 *   multiselect → checkbox list (multi-choice) + Submit
 */
export function ClarifyDialog({ projectId, requestId, payload }: Props) {
  const [textValue, setTextValue] = useState("");
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  // Reset widget state whenever a new payload arrives
  useEffect(() => {
    setTextValue("");
    setSelectedSingle(null);
    setSelectedMulti(new Set());
  }, [payload]);

  if (!payload) return null;

  const inputType = payload.input_type ?? "text";
  const options = payload.options ?? [];

  const isSubmittable = (): boolean => {
    if (inputType === "text") return textValue.trim().length > 0;
    if (inputType === "select") return selectedSingle !== null;
    // multiselect: allow submitting zero selections (user may want "none")
    return true;
  };

  const buildAnswer = (): string | string[] => {
    if (inputType === "text") return textValue.trim();
    if (inputType === "select") return selectedSingle ?? "";
    return Array.from(selectedMulti);
  };

  const submit = () => {
    if (!isSubmittable()) return;
    const answer = buildAnswer();
    start(async () => {
      const res = await clarifyRunAction({ projectId, requestId, answer });
      if (!res.ok) toast.error(res.message ?? "Yuborib bo'lmadi");
    });
  };

  const toggleMulti = (option: string) => {
    setSelectedMulti((prev) => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="clarify-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="flex gap-3"
      >
        {/* Bot avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/30">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Card body */}
        <div className="min-w-0 flex-1 rounded-lg border bg-card px-4 py-3">
          {/* Question */}
          <p className="mb-3 text-sm leading-relaxed">
            {payload.question ?? "Agent qo'shimcha ma'lumot kutmoqda"}
          </p>

          {/* --- text input --- */}
          {inputType === "text" && (
            <div className="flex items-end gap-2 rounded-md border bg-background px-3 py-2">
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={payload.placeholder ?? "Javobingiz…"}
                rows={2}
                disabled={pending}
                className="min-h-[40px] flex-1 resize-none bg-transparent text-sm focus:outline-none disabled:opacity-50"
              />
              <Button
                onClick={submit}
                disabled={pending || !isSubmittable()}
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg"
                aria-label="Yuborish"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* --- select (single choice, radio-style) --- */}
          {inputType === "select" && options.length > 0 && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {options.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                      selectedSingle === option
                        ? "border-foreground bg-muted/40 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:bg-muted/20 hover:text-foreground"
                    )}
                  >
                    {/* Custom radio */}
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selectedSingle === option
                          ? "border-primary"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {selectedSingle === option && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name="clarify-select"
                      value={option}
                      checked={selectedSingle === option}
                      onChange={() => setSelectedSingle(option)}
                      className="sr-only"
                      disabled={pending}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  onClick={submit}
                  disabled={pending || !isSubmittable()}
                  size="sm"
                  className="rounded-md"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Yuborish
                </Button>
              </div>
            </div>
          )}

          {/* --- multiselect (checkboxes) --- */}
          {inputType === "multiselect" && options.length > 0 && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {options.map((option) => {
                  const checked = selectedMulti.has(option);
                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                        checked
                          ? "border-foreground bg-muted/40 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:bg-muted/20 hover:text-foreground"
                      )}
                    >
                      {/* Custom checkbox */}
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                          checked ? "border-primary bg-primary" : "border-muted-foreground/40"
                        )}
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            className="h-2.5 w-2.5 text-primary-foreground"
                            strokeWidth={2}
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        value={option}
                        checked={checked}
                        onChange={() => toggleMulti(option)}
                        className="sr-only"
                        disabled={pending}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {selectedMulti.size > 0
                    ? `${selectedMulti.size} ta tanlandi`
                    : "Birortasini tanlang yoki bo'sh qoldiring"}
                </span>
                <Button
                  onClick={submit}
                  disabled={pending}
                  size="sm"
                  className="rounded-md"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Yuborish
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
