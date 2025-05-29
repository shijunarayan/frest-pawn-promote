import { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";

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
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "ID token is missing" }),
      };
    }

    const payload = await verifier.verify(idToken);

    const userId = String(payload.sub);
    const username = String(payload["cognito:username"] || payload["username"]);
    const tenantId = String(payload["custom:tenantId"]);

    if (!userId || !tenantId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Invalid token: missing userId or tenantId",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, username, tenantId }),
    };
  } catch (err: any) {
    console.error("Token verification failed:", err);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid or expired token" }),
    };
  }
};
