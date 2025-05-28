import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";

export const handler = withTenantContext(
  withCapability(Capabilities.VIEW_ROLES, async (event, { tenantId }) => {
    const userId = event.pathParameters?.targetUserId;

    if (!userId) {
      return errorResponse(
        "Missing or invalid input. Expecting targetUserId",
        400
      );
    }
    const roles = await getUserRolesFromDb(tenantId, userId);
    return successResponse({ roles });
  })
);
