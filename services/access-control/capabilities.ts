import { APIGatewayProxyHandler } from "aws-lambda";
import { getCapabilities } from "./accessAdapter";

export const handler: APIGatewayProxyHandler = async () => {
  const capabilities = await getCapabilities();

  return {
    statusCode: 200,
    body: JSON.stringify(capabilities),
  };
};
