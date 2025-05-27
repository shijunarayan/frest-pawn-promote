import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "@/services/utils/dynamodb";

export async function getMenuConfig(tenantId: string): Promise<any | null> {
  const result = await client.send(
    new GetCommand({
      TableName: process.env.MENU_CONFIG_TABLE!,
      Key: { tenantId },
    })
  );
  return result.Item || null;
}

export async function patchMenuConfig(
  tenantId: string,
  patch: Record<string, any>
): Promise<Record<string, any>> {
  const updates = Object.keys(patch)
    .map((key, i) => `#key${i} = :val${i}`)
    .join(", ");

  const exprAttrNames = Object.keys(patch).reduce(
    (acc, key, i) => ({ ...acc, [`#key${i}`]: key }),
    {}
  );

  const exprAttrValues = Object.values(patch).reduce(
    (acc, val, i) => ({ ...acc, [`:val${i}`]: val }),
    {}
  );

  const result = await client.send(
    new UpdateCommand({
      TableName: process.env.MENU_CONFIG_TABLE!,
      Key: { tenantId },
      UpdateExpression: `SET ${updates}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes || {};
}
