import { APIGatewayProxyHandler } from "aws-lambda";
import { getRoles } from "./accessAdapter";

export const handler: APIGatewayProxyHandler = async () => {
  const roles = await getRoles();

  return {
    statusCode: 200,
    body: JSON.stringify(roles),
  };
};
