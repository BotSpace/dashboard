import { z } from "zod";

export const telegramLoginSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "auth.errors.invalidOtp"),
});

export type TelegramLoginInput = z.infer<typeof telegramLoginSchema>;
