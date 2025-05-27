import { getTenantContext } from "./tokenUtils";
import { DynamoDBClient, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getUserRolesFromDb } from "../access-control/dynamoAdapter";

const capabilityCache = new Map<string, string[]>();
const client = new DynamoDBClient({});
const roleCapabilitiesTable = process.env.ROLE_CAPABILITIES_TABLE!;

export async function hasCapability(
  event: any,
  requiredCapability: string
): Promise<boolean> {
  const { tenantId, userId } = await getTenantContext(event);
  const cacheKey = `${tenantId}#${userId}`;

  if (capabilityCache.has(cacheKey)) {
    return capabilityCache.get(cacheKey)!.includes(requiredCapability);
  }

  const roles = await getUserRolesFromDb(tenantId, userId);
  if (!roles.length) return false;

  // Batch fetch all role capabilities
  const keys = roles.map((roleId: string) => ({
    tenantId: { S: tenantId },
    roleId: { S: roleId },
  }));

  const res = await client.send(
    new BatchGetItemCommand({
      RequestItems: {
        [roleCapabilitiesTable]: {
          Keys: keys,
        },
      },
    })
  );

  const capabilities = (res.Responses?.[roleCapabilitiesTable] || []).flatMap(
    (item) => unmarshall(item).capabilities || []
  );

  // Cache it during this Lambda invocation
  capabilityCache.set(cacheKey, capabilities);

  return capabilities.includes(requiredCapability);
}
