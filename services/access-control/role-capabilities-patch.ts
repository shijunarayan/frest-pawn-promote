import { APIGatewayProxyHandler } from "aws-lambda";
import { getRoleCapabilities, writeRoleCapabilities } from "./accessAdapter";

export const handler: APIGatewayProxyHandler = async (event) => {
  const roleId = event.pathParameters?.roleId;
  const { capabilities } = JSON.parse(event.body || "{}");

  if (!roleId || !Array.isArray(capabilities)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid payload" }),
    };
  }

  const roleCaps = await getRoleCapabilities();
  roleCaps[roleId] = capabilities;

  await writeRoleCapabilities(roleCaps);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Capabilities updated", roleId }),
  };
};
