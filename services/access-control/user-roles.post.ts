import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserRoles, writeUserRoles } from "./accessAdapter";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { username, roles } = JSON.parse(event.body || "{}");

  if (!username || !Array.isArray(roles)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid payload" }),
    };
  }

  const userRoles = await getUserRoles();
  userRoles[username] = roles;

  await writeUserRoles(userRoles);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User roles updated", username, roles }),
  };
};
