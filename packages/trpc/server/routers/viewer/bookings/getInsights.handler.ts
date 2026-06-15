import dayjs from "@calcom/dayjs";
import type { PrismaClient } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import type { TrpcSessionUser } from "../../../types";
import type { TGetInsightsInputSchema } from "./getInsights.schema";

type GetInsightsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: TGetInsightsInputSchema;
};

export type GetInsightsResponse = {
  totals: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  cancellationRate: number;
  dailyCounts: { date: string; count: number }[];
  topEventTypes: { eventTypeId: number; title: string; count: number }[];
  range: { startDate: string; endDate: string };
};

export const getInsightsHandler = async ({
  ctx,
  input,
}: GetInsightsOptions): Promise<GetInsightsResponse> => {
  const { prisma, user } = ctx;

  // Default to the last 30 days (inclusive of today).
  const endDate = input.endDate ? dayjs(input.endDate).endOf("day") : dayjs().endOf("day");
  const startDate = input.startDate
    ? dayjs(input.startDate).startOf("day")
    : endDate.subtract(29, "day").startOf("day");

  const now = new Date();
  const rangeStart = startDate.toDate();
  const rangeEnd = endDate.toDate();

  // Bookings owned by the current user, scheduled within the range.
  const baseWhere = {
    userId: user.id,
    startTime: {
      gte: rangeStart,
      lte: rangeEnd,
    },
  };

  const cancelledStatuses = [BookingStatus.CANCELLED, BookingStatus.REJECTED];

  const [total, cancelled, upcoming, completed, statusGroups, eventTypeGroups] = await Promise.all([
    // Total bookings in range.
    prisma.booking.count({ where: baseWhere }),
    // Cancelled + rejected.
    prisma.booking.count({
      where: { ...baseWhere, status: { in: cancelledStatuses } },
    }),
    // Upcoming: not cancelled/rejected and ending in the future.
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: { notIn: cancelledStatuses },
        endTime: { gte: now },
      },
    }),
    // Completed: not cancelled/rejected and already ended.
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: { notIn: cancelledStatuses },
        endTime: { lt: now },
      },
    }),
    // Per-day grouping done in JS below; fetch startTime + status for the range.
    prisma.booking.findMany({
      where: baseWhere,
      select: { startTime: true },
    }),
    // Top event types by booking volume in range.
    prisma.booking.groupBy({
      by: ["eventTypeId"],
      where: { ...baseWhere, eventTypeId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { eventTypeId: "desc" } },
      take: 5,
    }),
  ]);

  // Build a continuous daily series (gap-filled with 0) across the range.
  const dayCountMap = new Map<string, number>();
  for (const booking of statusGroups) {
    const key = dayjs(booking.startTime).format("YYYY-MM-DD");
    dayCountMap.set(key, (dayCountMap.get(key) ?? 0) + 1);
  }

  const dailyCounts: { date: string; count: number }[] = [];
  let cursor = startDate.startOf("day");
  const lastDay = endDate.startOf("day");
  while (cursor.isBefore(lastDay) || cursor.isSame(lastDay, "day")) {
    const key = cursor.format("YYYY-MM-DD");
    dailyCounts.push({ date: key, count: dayCountMap.get(key) ?? 0 });
    cursor = cursor.add(1, "day");
  }

  // Resolve event type titles for the top event types.
  const eventTypeIds = eventTypeGroups
    .map((group) => group.eventTypeId)
    .filter((id): id is number => id !== null);

  const eventTypes =
    eventTypeIds.length > 0
      ? await prisma.eventType.findMany({
          where: { id: { in: eventTypeIds } },
          select: { id: true, title: true },
        })
      : [];

  const titleById = new Map(eventTypes.map((et) => [et.id, et.title]));

  const topEventTypes = eventTypeGroups
    .filter((group): group is typeof group & { eventTypeId: number } => group.eventTypeId !== null)
    .map((group) => ({
      eventTypeId: group.eventTypeId,
      title: titleById.get(group.eventTypeId) ?? "Untitled",
      count: group._count._all,
    }));

  const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  return {
    totals: { total, upcoming, completed, cancelled },
    cancellationRate,
    dailyCounts,
    topEventTypes,
    range: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
  };
};
