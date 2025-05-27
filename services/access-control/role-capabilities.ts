import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";
import { hasCapability } from "../utils/accessControl";
import { Capabilities } from "./constants/capabilities";

const client = new DynamoDBClient({});
const tableName = process.env.ROLE_CAPABILITIES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const roleId = event.pathParameters?.roleId;

  if (!roleId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing roleId in path" }),
    };
  }

  try {
    const { tenantId } = await getTenantContext(event);

    const allowed = await hasCapability(event, Capabilities.VIEW_CAPABILITIES);
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    const result = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          tenantId: { S: tenantId },
          roleId: { S: roleId },
        },
      })
    );

    const item = result.Item ? unmarshall(result.Item) : null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        roleId,
        capabilities: item?.capabilities || [],
      }),
    };
  } catch (err) {
    console.error("Error fetching role capabilities:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
