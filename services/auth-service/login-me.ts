import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserRoles } from "../access-control/accessAdapter";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { jwtVerify, createRemoteJWKSet } = await import("jose");
  type JWTPayload = {
    [key: string]: unknown;
  };

  const REGION = process.env.AWS_REGION!;
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
  const JWKS = createRemoteJWKSet(
    new URL(
      `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
    )
  );

  try {
    const cookieHeader = event.headers.Cookie || event.headers.cookie || "";
    const accessToken = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: No access token" }),
      };
    }

    const verifyResult = await jwtVerify(accessToken, JWKS, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    });

    const payload = verifyResult.payload as JWTPayload;
    const username = payload["cognito:username"] || payload["username"];

    if (typeof username !== "string") {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: Invalid token" }),
      };
    }

    const userRolesMap = await getUserRoles();
    const roles = userRolesMap[username] || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ username, roles }),
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }
};
