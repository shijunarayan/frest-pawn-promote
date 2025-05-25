import { APIGatewayProxyHandler } from "aws-lambda";
import { successResponse, errorResponse } from "./response";

export const handler: APIGatewayProxyHandler = async (event) => {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());

  const hasAccessToken = cookies.some((cookie) =>
    cookie.startsWith("accessToken=")
  );

  if (hasAccessToken) {
    return successResponse({ isAuthenticated: true }, 200);
  }

  return errorResponse({ isAuthenticated: false }, 401);
};
