import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { getTenantContext } from "../utils/tokenUtils";

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const context = await getTenantContext(event);
    const roles = JSON.parse(event.body || "{}").roles;

    if (!Array.isArray(roles)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request: roles must be an array",
        }),
      };
    }

    const putCommand = new PutItemCommand({
      TableName: process.env.USER_ROLES_TABLE,
      Item: marshall({
        tenantId: context.tenantId,
        userId: context.userId,
        username: context.username,
        roles,
      }),
    });

    await client.send(putCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User roles saved",
        username: context.username,
        roles,
      }),
    };
  } catch (err) {
    console.error("Error saving user roles", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
