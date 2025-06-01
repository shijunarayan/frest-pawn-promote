import { APIGatewayProxyHandler } from "aws-lambda";
import { successResponse } from "@/services/auth-service/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  return successResponse({ success: true }, event, 200, {
    "Set-Cookie": [
      "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None;",
      "idToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None;",
      "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None;",
    ],
  });
};
