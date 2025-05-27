import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "./dynamoAdapter";
import { getTenantContext } from "../utils/tokenUtils";
import { hasCapability } from "../utils/accessControl";
import { Capabilities } from "./constants/capabilities";

const tableName = process.env.MENU_CONFIG_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { tenantId } = await getTenantContext(event);

    const allowed = await hasCapability(event, Capabilities.MANAGE_MENU);
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: { tenantId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Menu configuration not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    console.error("Error fetching menu config", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
