"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { GetInsightsResponse } from "@calcom/trpc/server/routers/viewer/bookings/getInsights.handler";
import { Badge } from "@calcom/ui/components/badge";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type InsightsData = GetInsightsResponse;

const StatCard = ({
  label,
  value,
  subLabel,
}: {
  label: string;
  value: number | string;
  subLabel?: string;
}) => {
  return (
    <div className="bg-default border-subtle flex flex-col gap-1 rounded-md border p-4">
      <span className="text-subtle text-sm font-medium">{label}</span>
      <span className="text-emphasis text-2xl font-semibold">{value}</span>
      {subLabel ? <span className="text-subtle text-xs">{subLabel}</span> : null}
    </div>
  );
};

const ChartTooltip = ({
  active,
  payload,
  label,
  bookingsLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  bookingsLabel: string;
}) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="bg-default border-subtle rounded-md border px-3 py-2 shadow-sm">
      <p className="text-emphasis text-sm font-medium">{label}</p>
      <p className="text-subtle text-xs">
        {payload[0].value} {bookingsLabel}
      </p>
    </div>
  );
};

const InsightsContent = ({ data }: { data: InsightsData }) => {
  const { t } = useLocale();
  const { totals, cancellationRate, dailyCounts, topEventTypes } = data;

  if (totals.total === 0) {
    return (
      <EmptyScreen
        Icon="chart-bar"
        headline={t("no_bookings_yet", { defaultValue: "No bookings yet" })}
        description={t("insights_empty_description", {
          defaultValue: "Once people start booking with you, your insights will appear here.",
        })}
      />
    );
  }

  // Show a readable subset of x-axis labels (every ~5th day) to avoid crowding.
  const tickFormatter = (value: string, index: number) => {
    if (index % 5 !== 0 && index !== dailyCounts.length - 1) {
      return "";
    }
    // value is YYYY-MM-DD; show MM/DD
    const [, month, day] = value.split("-");
    return `${month}/${day}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t("total", { defaultValue: "Total" })} value={totals.total} />
        <StatCard label={t("upcoming", { defaultValue: "Upcoming" })} value={totals.upcoming} />
        <StatCard label={t("completed", { defaultValue: "Completed" })} value={totals.completed} />
        <StatCard
          label={t("cancelled", { defaultValue: "Cancelled" })}
          value={totals.cancelled}
          subLabel={t("cancellation_rate", {
            defaultValue: "{{rate}}% cancellation rate",
            rate: cancellationRate,
          })}
        />
      </div>

      {/* Bookings over time chart */}
      <div className="bg-default border-subtle rounded-md border p-4">
        <h2 className="text-emphasis mb-4 text-base font-semibold">
          {t("bookings_last_30_days", { defaultValue: "Bookings over the last 30 days" })}
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyCounts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={tickFormatter}
                tick={{ fontSize: 12, fill: "currentColor" }}
                className="text-subtle"
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "currentColor" }}
                className="text-subtle"
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={
                  <ChartTooltip bookingsLabel={t("bookings", { defaultValue: "bookings" }).toLowerCase()} />
                }
              />
              <Bar dataKey="count" fill="var(--cal-brand, #111827)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top event types */}
      <div className="bg-default border-subtle rounded-md border p-4">
        <h2 className="text-emphasis mb-4 text-base font-semibold">
          {t("top_event_types", { defaultValue: "Top event types" })}
        </h2>
        <ul className="flex flex-col divide-y divide-subtle">
          {topEventTypes.map((eventType, index) => (
            <li
              key={eventType.eventTypeId}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="text-subtle w-4 text-sm font-medium">{index + 1}</span>
                <span className="text-emphasis text-sm font-medium">{eventType.title}</span>
              </div>
              <Badge variant="gray">
                {t("booking_count", {
                  defaultValue: "{{count}} bookings",
                  count: eventType.count,
                })}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const InsightsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-default border-subtle flex flex-col gap-2 rounded-md border p-4">
            <SkeletonText className="h-4 w-20" />
            <SkeletonText className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="bg-default border-subtle rounded-md border p-4">
        <SkeletonText className="mb-4 h-5 w-48" />
        <SkeletonText className="h-64 w-full" />
      </div>
      <div className="bg-default border-subtle rounded-md border p-4">
        <SkeletonText className="mb-4 h-5 w-32" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <SkeletonText key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function InsightsView() {
  const { t } = useLocale();
  const { data, isPending, isError } = trpc.viewer.bookings.getInsights.useQuery(
    {},
    {
      staleTime: 60 * 1000,
    }
  );

  if (isError) {
    return (
      <EmptyScreen
        Icon="triangle-alert"
        headline={t("something_went_wrong", { defaultValue: "Something went wrong" })}
        description={t("insights_error_description", {
          defaultValue: "We couldn't load your insights. Please try again later.",
        })}
      />
    );
  }

  if (isPending || !data) {
    return <InsightsSkeleton />;
  }

  return <InsightsContent data={data} />;
}
