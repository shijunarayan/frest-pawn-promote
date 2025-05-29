import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";
import { getRoleCapabilitiesBatch } from "@/services/adapters/capabilitiesAdapter";
import { getMenuConfig } from "@/services/adapters/menuAdapter";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";

export const handler = withTenantContext(
  withCapability(
    Capabilities.CONFIGURE_MENU_ACCESS,
    async (_event, { tenantId, userId }) => {
      const roles = await getUserRolesFromDb(tenantId, userId);
      if (!roles.length) return errorResponse("Unauthorized", 403);

      const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);
      const config = await getMenuConfig(tenantId);

      if (!config || !Array.isArray(config.items)) {
        return errorResponse("Menu config missing or invalid", 500);
      }

      // Filter menu items based on user capabilities
      const filteredItems = config.items.filter((item: any) => {
        const roleMatch =
          roles.includes("*") ||
          item.roles?.some((r: string) => roles.includes(r));
        const capabilityMatch = item.capabilities?.some((c: string) =>
          capabilities.includes(c)
        );
        return roleMatch || capabilityMatch;
      });

      return successResponse(filteredItems);
    }
  )
);
