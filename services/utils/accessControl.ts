import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";
import { getRoleCapabilitiesBatch } from "@/services/adapters/capabilitiesAdapter";
import { Capabilities as CapabilityList } from "@/services/access-control/constants/capabilities";

const capabilityCache = new Map<string, string[]>();

export async function hasCapability(
  tenantId: string,
  userId: string,
  requiredCapability: string
): Promise<boolean> {
  const cacheKey = `${tenantId}:${userId}`;
  if (capabilityCache.has(cacheKey)) {
    return (
      capabilityCache.get(cacheKey)!.includes(requiredCapability) ||
      capabilityCache.get(cacheKey)!.includes("*")
    );
  }

  const roles = await getUserRolesFromDb(tenantId, userId);
  if (!roles.length) return false;

  const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);

  capabilityCache.set(cacheKey, capabilities);
  return (
    capabilities.includes(requiredCapability) ||
    capabilityCache.get(cacheKey)!.includes("*")
  );
}

export async function getUserEffectiveCapabilities(
  tenantId: string,
  userId: string
): Promise<string[]> {
  const roles = await getUserRolesFromDb(tenantId, userId);
  if (!roles.length) return [];

  const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);
  return capabilities;
}

export function expandWildcardCapabilities(capabilities: string[]): string[] {
  if (capabilities.includes("*")) {
    return Object.values(CapabilityList); // All capabilities
  }
  return capabilities;
}
