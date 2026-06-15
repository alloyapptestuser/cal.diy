import { z } from "zod";

export const ZGetInsightsInputSchema = z.object({
  // ISO date strings. When omitted, the handler defaults to the last 30 days.
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type TGetInsightsInputSchema = z.infer<typeof ZGetInsightsInputSchema>;
