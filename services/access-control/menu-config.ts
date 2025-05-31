import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { getMenuConfig } from "@/services/adapters/menuAdapter";

export const handler = withTenantContext(
  withCapability(
    Capabilities.CONFIGURE_MENU_ACCESS,
    async (event, { tenantId }) => {
      const config = await getMenuConfig(tenantId);

      if (!config) {
        return errorResponse("No menu config found for tenant", event, 404);
      }

      return successResponse(config, event);
    }
  )
);
