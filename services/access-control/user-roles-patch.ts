import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { putUserRoles } from "@/services/adapters/rolesAdapter";

export const handler = withTenantContext(
  withCapability(Capabilities.ASSIGN_ROLES, async (event, { tenantId }) => {
    const body = JSON.parse(event.body || "{}");
    const { targetUserId, roles } = body;

    if (!targetUserId || !Array.isArray(roles)) {
      return errorResponse(
        "Missing or invalid input. Expecting targetUserId and roles[]",
        event,
        400
      );
    }

    await putUserRoles(tenantId, targetUserId, roles);
    return successResponse({ message: "Roles updated successfully." }, event);
  })
);
