import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { getRoleCapabilitiesBatch } from "@/services/adapters/capabilitiesAdapter";

export const handler = withTenantContext(
  withCapability(
    Capabilities.VIEW_CAPABILITIES,
    async (event, { tenantId }) => {
      const body = JSON.parse(event.body || "{}");
      const { roles } = body;

      if (!Array.isArray(roles) || roles.length === 0) {
        return errorResponse("Missing or invalid 'roles' array", 400);
      }

      const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);
      return successResponse({ capabilities });
    }
  )
);
