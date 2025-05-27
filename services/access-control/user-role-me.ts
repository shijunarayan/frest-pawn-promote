import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { tenantId, userId, username } = await getTenantContext(event);

    const client = new DynamoDBClient({});
    const tableName = process.env.USER_ROLES_TABLE!;

    const result = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          tenantId: { S: tenantId },
          userId: { S: userId },
        },
      })
    );

    const item = result.Item ? unmarshall(result.Item) : null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        username,
        roles: item?.roles || [],
      }),
    };
  } catch (err) {
    console.error("Failed to get user roles:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
