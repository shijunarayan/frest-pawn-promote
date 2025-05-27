import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { RegisterRequest } from "@/types/register";

const cognito = new CognitoIdentityProviderClient({});

export const handler = withTenantContext(
  withCapability(Capabilities.MANAGE_USERS, async (event, { tenantId }) => {
    const body = JSON.parse(event.body || "{}") as RegisterRequest;
    const {
      username,
      email,
      phone,
      password,
      requirePasswordReset = true,
      sendInvite = false,
    } = body;

    if (!username) {
      return errorResponse("Missing required field: username", 400);
    }

    if (!sendInvite && !password) {
      return errorResponse("Password is required when not sending invite", 400);
    }

    const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
    const userAttributes = [
      { Name: "custom:tenantId", Value: tenantId },
      email && { Name: "email", Value: email },
      phone && { Name: "phone_number", Value: phone },
      { Name: "preferred_username", Value: username },
    ].filter(Boolean);

    const createCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: userAttributes as any,
      TemporaryPassword: password,
      MessageAction: sendInvite ? undefined : "SUPPRESS",
    });

    await cognito.send(createCommand);

    if (!sendInvite) {
      await cognito.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          Password: password!,
          Permanent: !requirePasswordReset,
        })
      );
    }

    return successResponse({ message: "User registered successfully." });
  })
);
