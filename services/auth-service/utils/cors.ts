import { APIGatewayProxyEvent } from "aws-lambda";

export function getAllowOrigin(event: APIGatewayProxyEvent): string {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];
  const requestOrigin = event.headers?.origin || "";

  return allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] || "*";
}
