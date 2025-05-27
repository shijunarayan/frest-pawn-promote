import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import { successResponse } from "@/services/auth-service/response";
import { getAllRoles } from "@/services/adapters/rolesAdapter";

export const handler = withTenantContext(
  withCapability(Capabilities.VIEW_ROLES, async (event, { tenantId }) => {
    const roles = await getAllRoles(tenantId);
    return successResponse({ roles });
  })
);
