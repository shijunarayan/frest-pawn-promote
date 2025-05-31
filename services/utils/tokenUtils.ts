import { APIGatewayProxyEvent } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { TenantContext } from "@/types/context";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

export async function getTenantContext(event: APIGatewayProxyEvent) {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie || "";
  const idToken = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("idToken="))
    ?.split("=")[1];

  if (!idToken) throw new Error("Missing id token");

  const payload = await verifier.verify(idToken);

  const userId = String(payload.sub);
  const username = String(payload["cognito:username"]);
  const tenantId = String(payload["custom:tenantId"]);

  if (!userId || !username || !tenantId) return null;

  const tenantContext: TenantContext = {
    tenantId,
    userId,
    username,
  };

  return tenantContext;
}

export async function decodeIdToken(idToken: string) {
  const payload = await verifier.verify(idToken);
  return payload;
}
