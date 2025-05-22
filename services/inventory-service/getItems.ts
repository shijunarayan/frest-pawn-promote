import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Inventory retrieved successfully!",
      items: [], // placeholder for now
    }),
  };
};
