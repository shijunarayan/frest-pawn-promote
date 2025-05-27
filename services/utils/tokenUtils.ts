export type TenantContext = {
  userId: string;
  username: string;
  tenantId: string;
};

export async function getTenantContext(event: any): Promise<TenantContext> {
  const { createRemoteJWKSet, jwtVerify } = await import("jose");

  const cookieHeader = event.headers.Cookie || event.headers.cookie || "";
  const accessToken = cookieHeader
    .split(";")
    .find((c: string) => c.trim().startsWith("accessToken="))
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

  const userId = payload["sub"];
  const username =
    (payload["cognito:username"] as string) || (payload["username"] as string);
  const tenantId = payload["tenantId"] as string;

  if (!userId || !tenantId) throw new Error("Invalid token payload");

  return { userId, username, tenantId };
}
