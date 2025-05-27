import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import { successResponse } from "@/services/auth-service/response";
import { Capabilities as CapabilityList } from "@/services/access-control/constants/capabilities";

export const handler = withTenantContext(
  withCapability(Capabilities.VIEW_CAPABILITIES, async () => {
    const capabilities = Object.entries(CapabilityList).map(([key, value]) => ({
      id: value,
      label: key.replace(/_/g, " ").toLowerCase(), // Optional formatting
    }));

    return successResponse({ capabilities });
  })
);
