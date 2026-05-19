import { _generateMetadata } from "app/_utils";

import AppInsightsView from "~/apps/insights/insights-view";

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => `${t("app_insights")} | ${t("apps")}`,
    (t) => t("app_insights_description"),
    undefined,
    undefined,
    "/apps/insights"
  );
};

const ServerPage = async () => {
  return <AppInsightsView />;
};

export default ServerPage;
