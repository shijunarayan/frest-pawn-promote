"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
const tokenUtils_1 = require("@/services/utils/tokenUtils");
const rolesAdapter_1 = require("@/services/adapters/rolesAdapter");
const capabilitiesAdapter_1 = require("@/services/adapters/capabilitiesAdapter");
const accessControl_1 = require("@/services/utils/accessControl");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const handler = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body || "{}");
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.USER_POOL_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });
        const result = await client.send(command);
        const tokens = result.AuthenticationResult;
        if (!tokens) {
            return (0, response_1.errorResponse)("Authentication failed: Missing token set", event, 401);
        }
        const { AccessToken, IdToken, RefreshToken } = tokens;
        if (IdToken) {
            const payload = await (0, tokenUtils_1.decodeIdToken)(IdToken);
            const userId = String(payload.sub);
            const username = String(payload["cognito:username"]);
            const tenantId = String(payload["custom:tenantId"]);
            const roles = await (0, rolesAdapter_1.getUserRolesFromDb)(tenantId, userId);
            const rawCapabilities = await (0, capabilitiesAdapter_1.getRoleCapabilitiesBatch)(tenantId, roles);
            const effectiveCapabilities = (0, accessControl_1.expandWildcardCapabilities)(rawCapabilities);
            return (0, response_1.successResponse)({
                username,
                tenantId,
                roles,
                capabilities: effectiveCapabilities,
            }, event, 200, {
                "Set-Cookie": [
                    `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                    `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                    `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
                ],
            });
        }
        else {
            return (0, response_1.errorResponse)("Login failed to get idToken", event, 500);
        }
    }
    catch (err) {
        if (err.name === "NotAuthorizedException" || // wrong password
            err.name === "UserNotFoundException" // user doesn't exist
        ) {
            return (0, response_1.errorResponse)("Invalid username or password", event, 401);
        }
        console.error("Login error:", err);
        return (0, response_1.errorResponse)("Internal server error", event, 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTREO0FBQzVELDREQUE0RDtBQUM1RCxtRUFBc0U7QUFDdEUsaUZBQW1GO0FBQ25GLGtFQUE0RTtBQUU1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLGdFQUE2QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sT0FBTyxHQUEyQixLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDN0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxzREFBbUIsQ0FBQztZQUN0QyxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjtZQUMxQyxjQUFjLEVBQUU7Z0JBQ2QsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2FBQ25CO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUUzQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPLElBQUEsd0JBQWEsRUFDbEIsMENBQTBDLEVBQzFDLEtBQUssRUFDTCxHQUFHLENBQ0osQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFdEQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwwQkFBYSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFFcEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLGlDQUFrQixFQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6RCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUEsOENBQXdCLEVBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLE1BQU0scUJBQXFCLEdBQUcsSUFBQSwwQ0FBMEIsRUFBQyxlQUFlLENBQUMsQ0FBQztZQUUxRSxPQUFPLElBQUEsMEJBQWUsRUFDcEI7Z0JBQ0UsUUFBUTtnQkFDUixRQUFRO2dCQUNSLEtBQUs7Z0JBQ0wsWUFBWSxFQUFFLHFCQUFxQjthQUNwQyxFQUNELEtBQUssRUFDTCxHQUFHLEVBQ0g7Z0JBQ0UsWUFBWSxFQUFFO29CQUNaLGVBQWUsV0FBVyx5REFBeUQ7b0JBQ25GLFdBQVcsT0FBTyx5REFBeUQ7b0JBQzNFLGdCQUFnQixZQUFZLDJEQUEyRDtpQkFDeEY7YUFDRixDQUNGLENBQUM7UUFDSixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sSUFBQSx3QkFBYSxFQUFDLDZCQUE2QixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsRSxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsSUFDRSxHQUFHLENBQUMsSUFBSSxLQUFLLHdCQUF3QixJQUFJLGlCQUFpQjtZQUMxRCxHQUFHLENBQUMsSUFBSSxLQUFLLHVCQUF1QixDQUFDLHFCQUFxQjtVQUMxRCxDQUFDO1lBQ0QsT0FBTyxJQUFBLHdCQUFhLEVBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxPQUFPLElBQUEsd0JBQWEsRUFBQyx1QkFBdUIsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUQsQ0FBQztBQUNILENBQUMsQ0FBQztBQW5FVyxRQUFBLE9BQU8sV0FtRWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5SGFuZGxlciB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5pbXBvcnQge1xuICBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCxcbiAgSW5pdGlhdGVBdXRoQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jb2duaXRvLWlkZW50aXR5LXByb3ZpZGVyXCI7XG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZVwiO1xuaW1wb3J0IHsgZGVjb2RlSWRUb2tlbiB9IGZyb20gXCJAL3NlcnZpY2VzL3V0aWxzL3Rva2VuVXRpbHNcIjtcbmltcG9ydCB7IGdldFVzZXJSb2xlc0Zyb21EYiB9IGZyb20gXCJAL3NlcnZpY2VzL2FkYXB0ZXJzL3JvbGVzQWRhcHRlclwiO1xuaW1wb3J0IHsgZ2V0Um9sZUNhcGFiaWxpdGllc0JhdGNoIH0gZnJvbSBcIkAvc2VydmljZXMvYWRhcHRlcnMvY2FwYWJpbGl0aWVzQWRhcHRlclwiO1xuaW1wb3J0IHsgZXhwYW5kV2lsZGNhcmRDYXBhYmlsaXRpZXMgfSBmcm9tIFwiQC9zZXJ2aWNlcy91dGlscy9hY2Nlc3NDb250cm9sXCI7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7fSk7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBBUElHYXRld2F5UHJveHlIYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCBcInt9XCIpO1xuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbml0aWF0ZUF1dGhDb21tYW5kKHtcbiAgICAgIEF1dGhGbG93OiBcIlVTRVJfUEFTU1dPUkRfQVVUSFwiLFxuICAgICAgQ2xpZW50SWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQhLFxuICAgICAgQXV0aFBhcmFtZXRlcnM6IHtcbiAgICAgICAgVVNFUk5BTUU6IHVzZXJuYW1lLFxuICAgICAgICBQQVNTV09SRDogcGFzc3dvcmQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgY29uc3QgdG9rZW5zID0gcmVzdWx0LkF1dGhlbnRpY2F0aW9uUmVzdWx0O1xuXG4gICAgaWYgKCF0b2tlbnMpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFxuICAgICAgICBcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDogTWlzc2luZyB0b2tlbiBzZXRcIixcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIDQwMVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IEFjY2Vzc1Rva2VuLCBJZFRva2VuLCBSZWZyZXNoVG9rZW4gfSA9IHRva2VucztcblxuICAgIGlmIChJZFRva2VuKSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgZGVjb2RlSWRUb2tlbihJZFRva2VuKTtcbiAgICAgIGNvbnN0IHVzZXJJZCA9IFN0cmluZyhwYXlsb2FkLnN1Yik7XG4gICAgICBjb25zdCB1c2VybmFtZSA9IFN0cmluZyhwYXlsb2FkW1wiY29nbml0bzp1c2VybmFtZVwiXSk7XG4gICAgICBjb25zdCB0ZW5hbnRJZCA9IFN0cmluZyhwYXlsb2FkW1wiY3VzdG9tOnRlbmFudElkXCJdKTtcblxuICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCBnZXRVc2VyUm9sZXNGcm9tRGIodGVuYW50SWQsIHVzZXJJZCk7XG4gICAgICBjb25zdCByYXdDYXBhYmlsaXRpZXMgPSBhd2FpdCBnZXRSb2xlQ2FwYWJpbGl0aWVzQmF0Y2godGVuYW50SWQsIHJvbGVzKTtcbiAgICAgIGNvbnN0IGVmZmVjdGl2ZUNhcGFiaWxpdGllcyA9IGV4cGFuZFdpbGRjYXJkQ2FwYWJpbGl0aWVzKHJhd0NhcGFiaWxpdGllcyk7XG5cbiAgICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UoXG4gICAgICAgIHtcbiAgICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgICB0ZW5hbnRJZCxcbiAgICAgICAgICByb2xlcyxcbiAgICAgICAgICBjYXBhYmlsaXRpZXM6IGVmZmVjdGl2ZUNhcGFiaWxpdGllcyxcbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIDIwMCxcbiAgICAgICAge1xuICAgICAgICAgIFwiU2V0LUNvb2tpZVwiOiBbXG4gICAgICAgICAgICBgYWNjZXNzVG9rZW49JHtBY2Nlc3NUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgICAgIGBpZFRva2VuPSR7SWRUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgICAgIGByZWZyZXNoVG9rZW49JHtSZWZyZXNoVG9rZW59OyBIdHRwT25seTsgU2VjdXJlOyBTYW1lU2l0ZT1Ob25lOyBQYXRoPS87IE1heC1BZ2U9NjA0ODAwYCxcbiAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcIkxvZ2luIGZhaWxlZCB0byBnZXQgaWRUb2tlblwiLCBldmVudCwgNTAwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgaWYgKFxuICAgICAgZXJyLm5hbWUgPT09IFwiTm90QXV0aG9yaXplZEV4Y2VwdGlvblwiIHx8IC8vIHdyb25nIHBhc3N3b3JkXG4gICAgICBlcnIubmFtZSA9PT0gXCJVc2VyTm90Rm91bmRFeGNlcHRpb25cIiAvLyB1c2VyIGRvZXNuJ3QgZXhpc3RcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFwiSW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZFwiLCBldmVudCwgNDAxKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmVycm9yKFwiTG9naW4gZXJyb3I6XCIsIGVycik7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiwgZXZlbnQsIDUwMCk7XG4gIH1cbn07XG4iXX0=