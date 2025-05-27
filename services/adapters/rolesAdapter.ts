import { QueryCommand, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "@/services/utils/dynamodb";

export async function getUserRolesFromDb(
  tenantId: string,
  userId: string
): Promise<string[]> {
  const result = await client.send(
    new GetCommand({
      TableName: process.env.USER_ROLES_TABLE!,
      Key: { tenantId, userId },
    })
  );
  return result.Item?.roles ?? [];
}

export async function putUserRoles(
  tenantId: string,
  userId: string,
  roles: string[]
): Promise<void> {
  await client.send(
    new PutCommand({
      TableName: process.env.USER_ROLES_TABLE!,
      Item: { tenantId, userId, roles },
    })
  );
}

export async function getAllRoles(
  tenantId: string
): Promise<{ roleId: string; label: string }[]> {
  const result = await client.send(
    new QueryCommand({
      TableName: process.env.ROLES_TABLE!,
      KeyConditionExpression: "tenantId = :tenantId",
      ExpressionAttributeValues: {
        ":tenantId": tenantId,
      },
    })
  );

  const items = result.Items || [];

  return items.map((item) => ({
    roleId: item.roleId,
    label: item.label,
  }));
}
