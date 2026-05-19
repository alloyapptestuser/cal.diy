"use client";

import Link from "next/link";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import type { IconName } from "@calcom/ui/components/icon";

import Shell from "~/shell/Shell";

type StatTrend = "up" | "down" | "flat";

type Stat = {
  label: string;
  value: string;
  delta: string;
  trend: StatTrend;
  icon: IconName;
};

type ConnectedApp = {
  name: string;
  category: string;
  usage: number;
  trend: number;
  initial: string;
  color: string;
};

type HealthEntry = {
  name: string;
  status: "healthy" | "warning" | "error";
  detail: string;
  initial: string;
  color: string;
};

type ActivityEntry = {
  app: string;
  action: string;
  timestamp: string;
  icon: IconName;
  iconColor: string;
};

type Recommendation = {
  name: string;
  reason: string;
  category: string;
  initial: string;
  color: string;
};

// Mock data for the dashboard preview. In production these would
// be fed from credential repositories and usage metrics.
const stats: Stat[] = [
  { label: "total_apps_connected", value: "12", delta: "+2", trend: "up", icon: "grid-3x3" },
  { label: "active_integrations", value: "9", delta: "+1", trend: "up", icon: "activity" },
  { label: "events_synced", value: "1,248", delta: "+18%", trend: "up", icon: "calendar" },
  { label: "automation_runs", value: "342", delta: "-4%", trend: "down", icon: "zap" },
];

const dailyUsage = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 64 },
  { day: "Wed", value: 52 },
  { day: "Thu", value: 81 },
  { day: "Fri", value: 96 },
  { day: "Sat", value: 24 },
  { day: "Sun", value: 31 },
];

const mostUsedApps: ConnectedApp[] = [
  { name: "Google Calendar", category: "Calendar", usage: 92, trend: 12, initial: "G", color: "bg-blue-500" },
  { name: "Zoom", category: "Conferencing", usage: 78, trend: 8, initial: "Z", color: "bg-sky-500" },
  { name: "Slack", category: "Messaging", usage: 64, trend: -3, initial: "S", color: "bg-purple-500" },
  { name: "Stripe", category: "Payments", usage: 41, trend: 22, initial: "S", color: "bg-indigo-500" },
  { name: "HubSpot", category: "CRM", usage: 28, trend: 4, initial: "H", color: "bg-orange-500" },
];

const healthEntries: HealthEntry[] = [
  { name: "Google Calendar", status: "healthy", detail: "Synced 2 min ago", initial: "G", color: "bg-blue-500" },
  { name: "Zoom", status: "healthy", detail: "Synced 5 min ago", initial: "Z", color: "bg-sky-500" },
  { name: "Outlook Calendar", status: "warning", detail: "Token expires in 3 days", initial: "O", color: "bg-blue-700" },
  { name: "Salesforce", status: "error", detail: "Authorization expired", initial: "S", color: "bg-cyan-600" },
];

const recentActivity: ActivityEntry[] = [
  { app: "Google Calendar", action: "Synced 14 new events", timestamp: "2 min ago", icon: "calendar", iconColor: "text-blue-500" },
  { app: "Zoom", action: "Created meeting for Design Review", timestamp: "12 min ago", icon: "video", iconColor: "text-sky-500" },
  { app: "Stripe", action: "Processed $240 booking payment", timestamp: "1 hr ago", icon: "credit-card", iconColor: "text-indigo-500" },
  { app: "Slack", action: "Sent booking notification to #sales", timestamp: "3 hr ago", icon: "message-circle", iconColor: "text-purple-500" },
  { app: "HubSpot", action: "Created contact for jane@acme.co", timestamp: "Yesterday", icon: "users", iconColor: "text-orange-500" },
];

const recommendations: Recommendation[] = [
  { name: "Linear", reason: "Sync bookings to engineering tickets", category: "Productivity", initial: "L", color: "bg-violet-500" },
  { name: "Notion", reason: "Document meeting notes automatically", category: "Productivity", initial: "N", color: "bg-neutral-700" },
  { name: "Loom", reason: "Record async follow-ups after calls", category: "Video", initial: "L", color: "bg-purple-600" },
];

function StatusDot({ status }: { status: HealthEntry["status"] }) {
  const colorClass =
    status === "healthy" ? "bg-green-500" : status === "warning" ? "bg-amber-500" : "bg-red-500";
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={classNames(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          colorClass
        )}
      />
      <span className={classNames("relative inline-flex h-2.5 w-2.5 rounded-full", colorClass)} />
    </span>
  );
}

function AppAvatar({ initial, color }: { initial: string; color: string }) {
  return (
    <span
      className={classNames(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white",
        color
      )}>
      {initial}
    </span>
  );
}

export default function AppInsightsView() {
  const { t } = useLocale();
  const maxUsage = Math.max(...dailyUsage.map((d) => d.value));
  const healthyCount = healthEntries.filter((e) => e.status === "healthy").length;
  const warningCount = healthEntries.filter((e) => e.status === "warning").length;
  const errorCount = healthEntries.filter((e) => e.status === "error").length;

  return (
    <Shell
      heading={t("app_insights")}
      subtitle={t("app_insights_description")}
      title={`${t("app_insights")} | ${t("apps")}`}
      description={t("app_insights_description")}
      CTA={
        <Button color="primary" StartIcon="grid-3x3" href="/apps">
          {t("see_all_apps")}
        </Button>
      }>
      <div className="flex flex-col gap-y-6 pb-12">
        {/* Stat cards */}
        <section
          aria-label={t("app_insights")}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const trendColor =
              stat.trend === "up"
                ? "text-success"
                : stat.trend === "down"
                ? "text-error"
                : "text-subtle";
            const trendIcon: IconName =
              stat.trend === "up" ? "arrow-up-right" : stat.trend === "down" ? "arrow-down" : "arrow-right";
            return (
              <div
                key={stat.label}
                className="border-subtle bg-default flex flex-col gap-3 rounded-xl border p-5 transition hover:border-emphasis">
                <div className="flex items-center justify-between">
                  <span className="text-subtle text-xs font-medium uppercase tracking-wide">
                    {t(stat.label)}
                  </span>
                  <span className="bg-subtle text-emphasis flex h-8 w-8 items-center justify-center rounded-lg">
                    <Icon name={stat.icon} className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-emphasis text-3xl font-semibold leading-none">{stat.value}</span>
                  <span className={classNames("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
                    <Icon name={trendIcon} className="h-3.5 w-3.5" />
                    {stat.delta}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Usage chart + Health */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="border-subtle bg-default rounded-xl border p-6 lg:col-span-2">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-emphasis text-base font-semibold">{t("usage_over_time")}</h2>
                <p className="text-subtle mt-0.5 text-sm">{t("events_this_week")}</p>
              </div>
              <Badge variant="success" startIcon="arrow-up-right">
                +18%
              </Badge>
            </div>

            <div className="flex h-56 items-end gap-3">
              {dailyUsage.map((day) => {
                const heightPct = (day.value / maxUsage) * 100;
                return (
                  <div key={day.day} className="group flex flex-1 flex-col items-center gap-2">
                    <div className="text-subtle group-hover:text-emphasis text-xs font-medium transition">
                      {day.value}
                    </div>
                    <div className="bg-subtle relative flex w-full flex-1 overflow-hidden rounded-md">
                      <div
                        className="bg-emphasis absolute bottom-0 left-0 right-0 rounded-md transition-all duration-500 group-hover:opacity-80"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-subtle text-xs">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-subtle bg-default rounded-xl border p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-emphasis text-base font-semibold">{t("health_status")}</h2>
                <p className="text-subtle mt-0.5 text-sm">
                  {healthyCount} {t("healthy_connections").toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success text-xs font-medium">{healthyCount}</span>
                <span className="bg-subtle h-3 w-px" />
                <span className="text-attention text-xs font-medium">{warningCount}</span>
                <span className="bg-subtle h-3 w-px" />
                <span className="text-error text-xs font-medium">{errorCount}</span>
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {healthEntries.map((entry) => (
                <li
                  key={entry.name}
                  className="border-subtle flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <AppAvatar initial={entry.initial} color={entry.color} />
                    <div className="min-w-0">
                      <p className="text-emphasis truncate text-sm font-medium">{entry.name}</p>
                      <p className="text-subtle truncate text-xs">{entry.detail}</p>
                    </div>
                  </div>
                  {entry.status === "healthy" ? (
                    <StatusDot status="healthy" />
                  ) : (
                    <Button color="secondary" size="sm">
                      {t("reconnect_now")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Most used apps + Recent activity */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="border-subtle bg-default rounded-xl border p-6 lg:col-span-2">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-emphasis text-base font-semibold">{t("most_used_apps")}</h2>
                <p className="text-subtle mt-0.5 text-sm">{t("based_on_your_usage")}</p>
              </div>
              <Link
                href="/apps/installed/calendar"
                className="text-emphasis hover:text-default text-sm font-medium">
                {t("installed_apps")}
                <Icon name="arrow-right" className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="flex flex-col gap-3">
              {mostUsedApps.map((app) => (
                <li key={app.name} className="flex items-center gap-4">
                  <AppAvatar initial={app.initial} color={app.color} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-emphasis truncate text-sm font-medium">{app.name}</p>
                        <p className="text-subtle truncate text-xs">{app.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emphasis text-sm font-semibold">{app.usage}%</span>
                        <span
                          className={classNames(
                            "flex items-center gap-0.5 text-xs font-medium",
                            app.trend >= 0 ? "text-success" : "text-error"
                          )}>
                          <Icon
                            name={app.trend >= 0 ? "arrow-up-right" : "arrow-down"}
                            className="h-3 w-3"
                          />
                          {Math.abs(app.trend)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-subtle relative h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={classNames("absolute left-0 top-0 h-full rounded-full", app.color)}
                        style={{ width: `${app.usage}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-subtle bg-default flex flex-col rounded-xl border p-6">
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-emphasis text-base font-semibold">{t("recent_app_activity")}</h2>
              <Icon name="activity" className="text-subtle h-4 w-4" />
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center">
                <Icon name="activity" className="text-subtle mx-auto mb-2 h-8 w-8" />
                <p className="text-emphasis text-sm font-medium">{t("no_recent_activity")}</p>
                <p className="text-subtle mt-1 text-xs">{t("no_recent_activity_description")}</p>
              </div>
            ) : (
              <ol className="flex flex-1 flex-col">
                {recentActivity.map((item, idx) => (
                  <li
                    key={`${item.app}-${idx}`}
                    className="relative flex gap-3 pb-4 last:pb-0">
                    {idx !== recentActivity.length - 1 && (
                      <span
                        aria-hidden
                        className="bg-subtle absolute left-[15px] top-8 h-full w-px"
                      />
                    )}
                    <span className="bg-subtle relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <Icon name={item.icon} className={classNames("h-4 w-4", item.iconColor)} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-emphasis text-sm font-medium">{item.app}</p>
                      <p className="text-subtle text-xs">{item.action}</p>
                      <p className="text-subtle mt-0.5 text-xs">{item.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <Link
              href="/apps/installed/calendar"
              className="text-emphasis hover:text-default mt-4 text-center text-sm font-medium">
              {t("view_all_activity")}
            </Link>
          </div>
        </section>

        {/* Recommendations */}
        <section className="border-subtle bg-default rounded-xl border p-6">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon name="sparkles" className="text-emphasis h-4 w-4" />
              <h2 className="text-emphasis text-base font-semibold">{t("recommended_for_you")}</h2>
            </div>
            <span className="text-subtle text-xs">{t("based_on_your_usage")}</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recommendations.map((rec) => (
              <div
                key={rec.name}
                className="border-subtle hover:border-emphasis flex flex-col gap-3 rounded-lg border p-4 transition">
                <div className="flex items-center justify-between">
                  <AppAvatar initial={rec.initial} color={rec.color} />
                  <Badge variant="gray" size="sm">
                    {rec.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-emphasis text-sm font-semibold">{rec.name}</p>
                  <p className="text-subtle mt-0.5 text-xs">{rec.reason}</p>
                </div>
                <Button color="secondary" size="sm" StartIcon="plus" className="mt-1 w-full justify-center">
                  {t("install_app")}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
