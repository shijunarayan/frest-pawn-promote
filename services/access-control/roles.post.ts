import { APIGatewayProxyHandler } from "aws-lambda";
import { getRoles, writeRoles } from "./accessAdapter";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id, label } = JSON.parse(event.body || "{}");

  if (!id || !label) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Role id and label are required" }),
    };
  }

  const roles = await getRoles();

  if (roles.find((r: { id: string }) => r.id === id)) {
    return {
      statusCode: 409,
      body: JSON.stringify({ message: "Role already exists" }),
    };
  }

  roles.push({ id, label });

  await writeRoles(roles);

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Role created", id }),
  };
};
