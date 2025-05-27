import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";
import { hasCapability } from "../utils/accessControl";

const client = new DynamoDBClient({});
const tableName = process.env.ROLES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { tenantId } = await getTenantContext(event);

    const allowed = await hasCapability(event, "view_roles");
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "tenantId = :tenantId",
        ExpressionAttributeValues: {
          ":tenantId": { S: tenantId },
        },
      })
    );

    const roles = result.Items?.map((item) => unmarshall(item)) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(roles),
    };
  } catch (err) {
    console.error("Error fetching roles:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
