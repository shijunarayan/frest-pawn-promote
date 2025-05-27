import { APIGatewayProxyHandler } from "aws-lambda";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "./dynamoAdapter";
import { getTenantContext } from "../utils/tokenUtils";
import { hasCapability } from "../utils/accessControl";
import { Capabilities } from "./constants/capabilities";
import { NativeAttributeValue } from "@aws-sdk/lib-dynamodb";

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

    const body = JSON.parse(event.body || "{}");
    const { system_items, configurable_items } = body;

    if (!Array.isArray(system_items) && !Array.isArray(configurable_items)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "At least one of 'system_items' or 'configurable_items' must be an array",
        }),
      };
    }

    const updateParts: string[] = [];
    const expressionValues: Record<string, NativeAttributeValue> = {};

    if (Array.isArray(system_items)) {
      updateParts.push("system_items = :system_items");
      expressionValues[":system_items"] = system_items;
    }

    if (Array.isArray(configurable_items)) {
      updateParts.push("configurable_items = :configurable_items");
      expressionValues[":configurable_items"] = configurable_items;
    }

    await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { tenantId },
        UpdateExpression: "SET " + updateParts.join(", "),
        ExpressionAttributeValues: expressionValues,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Menu configuration updated" }),
    };
  } catch (err) {
    console.error("Error updating menu config", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
