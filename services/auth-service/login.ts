import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";
import { decodeIdToken } from "@/services/utils/tokenUtils";
import { getUserRolesFromDb } from "@/services/adapters/rolesAdapter";
import { getRoleCapabilitiesBatch } from "@/services/adapters/capabilitiesAdapter";
import { expandWildcardCapabilities } from "@/services/utils/accessControl";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const result = await client.send(command);
    const tokens = result.AuthenticationResult;

    if (!tokens) {
      return errorResponse(
        "Authentication failed: Missing token set",
        event,
        401
      );
    }

    const { AccessToken, IdToken, RefreshToken } = tokens;

    if (IdToken) {
      const payload = await decodeIdToken(IdToken);
      const userId = String(payload.sub);
      const username = String(payload["cognito:username"]);
      const tenantId = String(payload["custom:tenantId"]);

      const roles = await getUserRolesFromDb(tenantId, userId);
      const rawCapabilities = await getRoleCapabilitiesBatch(tenantId, roles);
      const effectiveCapabilities = expandWildcardCapabilities(rawCapabilities);

      return successResponse(
        {
          username,
          tenantId,
          roles,
          capabilities: effectiveCapabilities,
        },
        event,
        200,
        {
          "Set-Cookie": [
            `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
            `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
            `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
          ],
        }
      );
    } else {
      return errorResponse("Login failed to get idToken", event, 500);
    }
  } catch (err: any) {
    if (
      err.name === "NotAuthorizedException" || // wrong password
      err.name === "UserNotFoundException" // user doesn't exist
    ) {
      return errorResponse("Invalid username or password", event, 401);
    }

    console.error("Login error:", err);
    return errorResponse("Internal server error", event, 500);
  }
};
