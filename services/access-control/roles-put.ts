import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";
import { hasCapability } from "../utils/accessControl";
import { Capabilities } from "./constants/capabilities";

const client = new DynamoDBClient({});
const tableName = process.env.ROLES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const roleId = event.pathParameters?.roleId;
  const { label } = JSON.parse(event.body || "{}");

  if (!roleId || !label) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing roleId or label" }),
    };
  }

  try {
    const { tenantId } = await getTenantContext(event);

    const allowed = await hasCapability(event, Capabilities.MANAGE_ROLES);
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    await client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: marshall({ tenantId, roleId, label }),
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Role upserted", roleId, label }),
    };
  } catch (err) {
    console.error("Error upserting role:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
