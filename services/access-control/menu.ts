import { withTenantContext } from "@/services/utils/withTenantContext";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";
import { getRoleCapabilitiesBatch } from "@/services/adapters/capabilitiesAdapter";
import { getMenuConfig } from "@/services/adapters/menuAdapter";

export const handler = withTenantContext(
  async (_event, { tenantId, userId }) => {
    const roles = await getUserRolesFromDb(tenantId, userId);
    if (!roles.length) return successResponse([]);

    const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);
    const menuConfig = await getMenuConfig(tenantId);

    if (!menuConfig || !Array.isArray(menuConfig.items)) {
      return errorResponse("Menu config is missing or invalid", 500);
    }

    // Filter logic
    const filteredItems = menuConfig.items.filter((item: any) => {
      const roleMatch =
        item.roles?.includes("*") ||
        item.roles?.some((r: string) => roles.includes(r));
      const capabilityMatch = item.capabilities?.some((c: string) =>
        capabilities.includes(c)
      );
      return roleMatch || capabilityMatch;
    });

    return successResponse(filteredItems);
  }
);
