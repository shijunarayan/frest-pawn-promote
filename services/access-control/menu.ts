import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserRoles } from "./accessAdapter";
import menuConfig from "./menu-config.tenant1.json";

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.queryStringParameters?.username;

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Username is required" }),
    };
  }

  const userRoles = await getUserRoles();
  const roles = userRoles[username] || [];

  const filteredMenu = [
    ...menuConfig.system_items,
    ...menuConfig.configurable_items,
  ].filter((item) => {
    return (
      item.roles.includes("*") ||
      roles.some((r: string) => item.roles.includes(r))
    );
  });

  return {
    statusCode: 200,
    body: JSON.stringify(filteredMenu),
  };
};
