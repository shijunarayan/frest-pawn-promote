import { APIGatewayProxyEvent } from "aws-lambda";
import { TenantContext } from "../../types/context";

export async function getTenantContext(
  event: APIGatewayProxyEvent
): Promise<TenantContext | null> {
  const { createRemoteJWKSet, jwtVerify } = await import("jose");

  const cookieHeader = event.headers.Cookie || event.headers.cookie || "";
  const accessToken = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("accessToken="))
    ?.split("=")[1];

  if (!accessToken) throw new Error("Missing access token");

  const REGION = process.env.AWS_REGION!;
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
  const JWKS = createRemoteJWKSet(
    new URL(
      `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
    )
  );

  const { payload } = await jwtVerify(accessToken, JWKS, {
    issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
  });

  const userId = payload.sub as string;
  const username = payload["username"] as string;
  const tenantId = payload["custom:tenantId"] as string;

  if (!userId || !username || !tenantId) return null;

  return { userId, username, tenantId };
}
