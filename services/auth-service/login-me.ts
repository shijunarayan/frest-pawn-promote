import { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { errorResponse, successResponse } from "./response";

const REGION = process.env.AWS_REGION!;
const USER_POOL_ID = process.env.USER_POOL_ID!;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  clientId: USER_POOL_CLIENT_ID,
  tokenUse: "id", // or "access" if you want to verify access tokens
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie || "";

    const idToken = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("idToken="))
      ?.split("=")[1];

    if (!idToken) {
      return errorResponse({ message: "ID token is missing" }, event, 401);
    }

    const payload = await verifier.verify(idToken);

    const userId = String(payload.sub);
    const username = String(payload["cognito:username"] || payload["username"]);
    const tenantId = String(payload["custom:tenantId"]);

    if (!userId || !tenantId) {
      return errorResponse(
        { message: "Invalid token: missing userId or tenantId" },
        event,
        403
      );
    }

    return successResponse({ userId, username, tenantId }, event);
  } catch (err: any) {
    console.error("Token verification failed:", err);
    return errorResponse({ message: "Invalid or expired token" }, event, 401);
  }
};
