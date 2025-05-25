import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyHandler } from "aws-lambda";
import { errorResponse, successResponse } from "./response";
import { getAllowOrigin } from "./utils/cors";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  const allowOrigin = getAllowOrigin(event);

  try {
    const { username, tempPassword, newPassword } = JSON.parse(
      event.body || "{}"
    );

    if (!username || !tempPassword || !newPassword) {
      return errorResponse("Missing required fields", allowOrigin, 400);
    }

    // Step 1: Initiate auth
    const authResp = await client.send(
      new AdminInitiateAuthCommand({
        AuthFlow: "ADMIN_NO_SRP_AUTH",
        UserPoolId: process.env.USER_POOL_ID!,
        ClientId: process.env.USER_POOL_CLIENT_ID!,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: tempPassword,
        },
      })
    );

    // Must be NEW_PASSWORD_REQUIRED challenge
    if (authResp.ChallengeName !== "NEW_PASSWORD_REQUIRED") {
      return errorResponse(
        "Unexpected challenge: " + authResp.ChallengeName,
        allowOrigin,
        400
      );
    }

    // Step 2: Respond with new password
    const finalResp = await client.send(
      new AdminRespondToAuthChallengeCommand({
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        ClientId: process.env.USER_POOL_CLIENT_ID!,
        UserPoolId: process.env.USER_POOL_ID!,
        Session: authResp.Session,
        ChallengeResponses: {
          USERNAME: username,
          NEW_PASSWORD: newPassword,
        },
      })
    );

    return successResponse(
      { message: "Password changed successfully" },
      allowOrigin
    );
  } catch (err) {
    console.error("Confirm error:", err);
    return errorResponse(err, allowOrigin);
  }
};
