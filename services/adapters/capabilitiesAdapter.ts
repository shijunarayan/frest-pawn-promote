import { BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "@/services/utils/dynamodb";
import { Role } from "@/types/role";

export async function getRoleCapabilitiesBatch(
  tenantId: string,
  roles: string[]
): Promise<string[]> {
  if (!roles.length) return [];

  const keys = roles.map((roleId) => ({ tenantId, roleId }));

  const result = await client.send(
    new BatchGetCommand({
      RequestItems: {
        [process.env.ROLES_TABLE!]: {
          Keys: keys,
        },
      },
    })
  );

  const roleItems =
    (result.Responses?.[process.env.ROLES_TABLE!] as Role[]) ?? [];

  const capabilities = roleItems.flatMap((r: Role) => r.capabilities ?? []);
  return [...new Set(capabilities)];
}
