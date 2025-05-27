import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";

const rawClient = new DynamoDBClient({});
export const client = DynamoDBDocumentClient.from(rawClient);

// === USER ROLES ===

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

  return result.Item?.roles || [];
}

export async function writeUserRolesToDb(
  tenantId: string,
  userId: string,
  username: string,
  roles: string[]
): Promise<void> {
  await client.send(
    new PutCommand({
      TableName: process.env.USER_ROLES_TABLE!,
      Item: { tenantId, userId, username, roles },
    })
  );
}

// === ROLES ===

export async function getAllRolesForTenant(
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

// === ROLE CAPABILITIES ===

export async function getRoleCapabilitiesBatch(
  tenantId: string,
  roleIds: string[]
): Promise<string[]> {
  if (!roleIds.length) return [];

  const keys = roleIds.map((roleId) => ({ tenantId, roleId }));

  const result = await client.send(
    new BatchGetCommand({
      RequestItems: {
        [process.env.ROLE_CAPABILITIES_TABLE!]: {
          Keys: keys,
        },
      },
    })
  );

  const responses =
    result.Responses?.[process.env.ROLE_CAPABILITIES_TABLE!] || [];
  return responses.flatMap((item) => item.capabilities || []);
}
