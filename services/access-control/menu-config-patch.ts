import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { patchMenuConfig } from "@/services/adapters/menuAdapter";

export const handler = withTenantContext(
  withCapability(
    Capabilities.CONFIGURE_MENU_ACCESS,
    async (event, { tenantId }) => {
      const body = JSON.parse(event.body || "{}");
      const { patch } = body;

      if (!patch || typeof patch !== "object") {
        return errorResponse("Missing or invalid 'patch' object", 400);
      }

      const updated = await patchMenuConfig(tenantId, patch);
      return successResponse({ message: "Menu config updated", updated });
    }
  )
);
