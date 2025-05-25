import { APIGatewayProxyHandler } from "aws-lambda";
import menuConfig from "./menu-config.tenant1.json";

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(menuConfig),
  };
};
