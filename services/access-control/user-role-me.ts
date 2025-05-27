import { withTenantContext } from "@/services/utils/withTenantContext";
import { successResponse } from "@/services/auth-service/response";
import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";

export const handler = withTenantContext(
  async (event, { tenantId, userId }) => {
    const roles = await getUserRolesFromDb(tenantId, userId);
    return successResponse({ roles });
  }
);
