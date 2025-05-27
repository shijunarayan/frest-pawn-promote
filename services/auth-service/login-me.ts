import { APIGatewayProxyHandler } from "aws-lambda";

const REGION = process.env.AWS_REGION!;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");

    const JWKS = createRemoteJWKSet(
      new URL(
        `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
      )
    );

    const cookieHeader = event.headers.Cookie || event.headers.cookie || "";
    const accessToken = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Access token missing" }),
      };
    }

    const { payload } = await jwtVerify(accessToken, JWKS, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    });

    const userId = payload.sub as string;
    const username = (payload["cognito:username"] ||
      payload.username) as string;
    const tenantId = payload["custom:tenantId"] as string;

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
