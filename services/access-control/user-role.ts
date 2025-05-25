import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserRoles } from "./accessAdapter";

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.pathParameters?.username;

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Username is required" }),
    };
  }

  const rolesByUser = await getUserRoles();
  const roles = rolesByUser[username] || [];

  return {
    statusCode: 200,
    body: JSON.stringify({ username, roles }),
  };
};
