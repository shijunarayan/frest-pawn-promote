import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";
import { getUserRolesFromDb } from "./dynamoAdapter";
import { getRoleCapabilitiesBatch } from "./dynamoAdapter";

const client = new DynamoDBClient({});
const tableName = process.env.MENU_CONFIG_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { tenantId, userId } = await getTenantContext(event);

    // Step 1: Get user roles
    const roles = await getUserRolesFromDb(tenantId, userId);
    if (!roles.length) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "No roles assigned" }),
      };
    }

    // Step 2: Get capabilities for those roles
    const capabilities = await getRoleCapabilitiesBatch(tenantId, roles);

    // Step 3: Load tenant menu config
    const result = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          tenantId: { S: tenantId },
        },
      })
    );

    const menuConfig = result.Item ? unmarshall(result.Item) : null;

    if (!menuConfig) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No menu config found for tenant" }),
      };
    }

    // Step 4: Filter items by matching capability or wildcard
    const filterByAccess = (items: any[]) =>
      items.filter((item) => {
        return (
          item.roles?.includes("*") ||
          item.roles?.some((r: string) => roles.includes(r)) ||
          item.capabilities?.some((c: string) => capabilities.includes(c))
        );
      });

    const filtered = {
      system_items: filterByAccess(menuConfig.system_items || []),
      configurable_items: filterByAccess(menuConfig.configurable_items || []),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(filtered),
    };
  } catch (err) {
    console.error("Error loading menu config", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
