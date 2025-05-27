import { BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "@/services/utils/dynamodb";

export async function getRoleCapabilitiesBatch(
  tenantId: string,
  roles: string[]
): Promise<string[]> {
  const keys = roles.map((role) => ({ tenantId, role }));

  const result = await client.send(
    new BatchGetCommand({
      RequestItems: {
        [process.env.ROLE_CAPABILITIES_TABLE!]: {
          Keys: keys,
        },
      },
    })
  );

  const capabilities =
    result.Responses?.[process.env.ROLE_CAPABILITIES_TABLE!] ?? [];
  return [...new Set(capabilities.flatMap((r: any) => r.capabilities))];
}
