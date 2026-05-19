import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { checkOnboardingRedirect } from "@calcom/features/auth/lib/onboardingUtils";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

const RedirectPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session?.user?.id) {
    // In the Alloy preview sandbox, skip the login screen and use the seeded
    // demo user instead so reviewers land straight on the dashboard.
    if (process.env.IS_ALLOY === "true") {
      redirect("/api/auth/alloy-auto-login");
    }
    redirect("/auth/login");
  }

  // Check if user needs onboarding and redirect before going to event-types
  const organizationId = session.user.profile?.organizationId ?? null;
  const onboardingPath = await checkOnboardingRedirect(session.user.id, {
    checkEmailVerification: true,
    organizationId,
  });
  if (onboardingPath) {
    redirect(onboardingPath);
  }

  redirect("/event-types");
};

export default RedirectPage;
