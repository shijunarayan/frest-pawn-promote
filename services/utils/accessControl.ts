import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";
import { getRoleCapabilitiesBatch } from "@/services/adapters/capabilitiesAdapter";

const capabilityCache = new Map<string, string[]>();

export async function hasCapability(
  tenantId: string,
  userId: string,
  requiredCapability: string
): Promise<boolean> {
  const cacheKey = `${tenantId}:${userId}`;
  if (capabilityCache.has(cacheKey)) {
    return capabilityCache.get(cacheKey)!.includes(requiredCapability);
  }

  const roles = await getUserRolesFromDb(tenantId, userId);
  if (!roles.length) return false;

  const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);

  capabilityCache.set(cacheKey, capabilities);
  return capabilities.includes(requiredCapability);
}
