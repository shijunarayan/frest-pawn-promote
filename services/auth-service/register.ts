import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { errorResponse, successResponse } from "./response";
import { getTenantContext } from "../utils/tokenUtils";
import { hasCapability } from "../utils/accessControl";
import { Capabilities } from "../access-control/constants/capabilities";

const client = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { tenantId } = await getTenantContext(event);

    const allowed = await hasCapability(event, Capabilities.MANAGE_USERS);
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    const { username, email, phone, password } = JSON.parse(event.body || "{}");

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing username, email or password",
        }),
      };
    }

    const command = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      TemporaryPassword: password,
      MessageAction: "SUPPRESS",
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "phone_number", Value: phone },
        { Name: "custom:tenantId", Value: tenantId },
      ],
    });

    await client.send(command);

    return successResponse({ message: "User created", username });
  } catch (err) {
    console.error("Register error:", err);
    return errorResponse(err);
  }
};
