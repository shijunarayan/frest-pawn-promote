import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { roles } = JSON.parse(event.body || "{}");

  if (!Array.isArray(roles)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid payload: roles must be an array",
      }),
    };
  }

  try {
    const { tenantId, userId, username } = await getTenantContext(event);

    const client = new DynamoDBClient({});
    const tableName = process.env.USER_ROLES_TABLE!;

    const item = marshall({
      tenantId,
      userId,
      username,
      roles,
    });

    await client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: item,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Roles updated",
        userId,
        roles,
      }),
    };
  } catch (err) {
    console.error("Error updating user roles:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
