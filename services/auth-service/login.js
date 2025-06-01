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
                success: true,
                username,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTREO0FBQzVELDREQUE0RDtBQUM1RCxtRUFBc0U7QUFDdEUsaUZBQW1GO0FBQ25GLGtFQUE0RTtBQUU1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLGdFQUE2QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sT0FBTyxHQUEyQixLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDN0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxzREFBbUIsQ0FBQztZQUN0QyxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjtZQUMxQyxjQUFjLEVBQUU7Z0JBQ2QsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2FBQ25CO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUUzQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPLElBQUEsd0JBQWEsRUFDbEIsMENBQTBDLEVBQzFDLEtBQUssRUFDTCxHQUFHLENBQ0osQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFdEQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwwQkFBYSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFFcEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLGlDQUFrQixFQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6RCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUEsOENBQXdCLEVBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLE1BQU0scUJBQXFCLEdBQUcsSUFBQSwwQ0FBMEIsRUFBQyxlQUFlLENBQUMsQ0FBQztZQUUxRSxPQUFPLElBQUEsMEJBQWUsRUFDcEI7Z0JBQ0UsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsUUFBUTtnQkFDUixLQUFLO2dCQUNMLFlBQVksRUFBRSxxQkFBcUI7YUFDcEMsRUFDRCxLQUFLLEVBQ0wsR0FBRyxFQUNIO2dCQUNFLFlBQVksRUFBRTtvQkFDWixlQUFlLFdBQVcseURBQXlEO29CQUNuRixXQUFXLE9BQU8seURBQXlEO29CQUMzRSxnQkFBZ0IsWUFBWSwyREFBMkQ7aUJBQ3hGO2FBQ0YsQ0FDRixDQUFDO1FBQ0osQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUEsd0JBQWEsRUFBQyw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ2xCLElBQ0UsR0FBRyxDQUFDLElBQUksS0FBSyx3QkFBd0IsSUFBSSxpQkFBaUI7WUFDMUQsR0FBRyxDQUFDLElBQUksS0FBSyx1QkFBdUIsQ0FBQyxxQkFBcUI7VUFDMUQsQ0FBQztZQUNELE9BQU8sSUFBQSx3QkFBYSxFQUFDLDhCQUE4QixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkMsT0FBTyxJQUFBLHdCQUFhLEVBQUMsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDLENBQUM7QUFuRVcsUUFBQSxPQUFPLFdBbUVsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtcbiAgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQsXG4gIEluaXRpYXRlQXV0aENvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY29nbml0by1pZGVudGl0eS1wcm92aWRlclwiO1xuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcbmltcG9ydCB7IGRlY29kZUlkVG9rZW4gfSBmcm9tIFwiQC9zZXJ2aWNlcy91dGlscy90b2tlblV0aWxzXCI7XG5pbXBvcnQgeyBnZXRVc2VyUm9sZXNGcm9tRGIgfSBmcm9tIFwiQC9zZXJ2aWNlcy9hZGFwdGVycy9yb2xlc0FkYXB0ZXJcIjtcbmltcG9ydCB7IGdldFJvbGVDYXBhYmlsaXRpZXNCYXRjaCB9IGZyb20gXCJAL3NlcnZpY2VzL2FkYXB0ZXJzL2NhcGFiaWxpdGllc0FkYXB0ZXJcIjtcbmltcG9ydCB7IGV4cGFuZFdpbGRjYXJkQ2FwYWJpbGl0aWVzIH0gZnJvbSBcIkAvc2VydmljZXMvdXRpbHMvYWNjZXNzQ29udHJvbFwiO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQoe30pO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlcjogQVBJR2F0ZXdheVByb3h5SGFuZGxlciA9IGFzeW5jIChldmVudCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgdXNlcm5hbWUsIHBhc3N3b3JkIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkgfHwgXCJ7fVwiKTtcblxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW5pdGlhdGVBdXRoQ29tbWFuZCh7XG4gICAgICBBdXRoRmxvdzogXCJVU0VSX1BBU1NXT1JEX0FVVEhcIixcbiAgICAgIENsaWVudElkOiBwcm9jZXNzLmVudi5VU0VSX1BPT0xfQ0xJRU5UX0lEISxcbiAgICAgIEF1dGhQYXJhbWV0ZXJzOiB7XG4gICAgICAgIFVTRVJOQU1FOiB1c2VybmFtZSxcbiAgICAgICAgUEFTU1dPUkQ6IHBhc3N3b3JkLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZW5kKGNvbW1hbmQpO1xuICAgIGNvbnN0IHRva2VucyA9IHJlc3VsdC5BdXRoZW50aWNhdGlvblJlc3VsdDtcblxuICAgIGlmICghdG9rZW5zKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcbiAgICAgICAgXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6IE1pc3NpbmcgdG9rZW4gc2V0XCIsXG4gICAgICAgIGV2ZW50LFxuICAgICAgICA0MDFcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBBY2Nlc3NUb2tlbiwgSWRUb2tlbiwgUmVmcmVzaFRva2VuIH0gPSB0b2tlbnM7XG5cbiAgICBpZiAoSWRUb2tlbikge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IGRlY29kZUlkVG9rZW4oSWRUb2tlbik7XG4gICAgICBjb25zdCB1c2VySWQgPSBTdHJpbmcocGF5bG9hZC5zdWIpO1xuICAgICAgY29uc3QgdXNlcm5hbWUgPSBTdHJpbmcocGF5bG9hZFtcImNvZ25pdG86dXNlcm5hbWVcIl0pO1xuICAgICAgY29uc3QgdGVuYW50SWQgPSBTdHJpbmcocGF5bG9hZFtcImN1c3RvbTp0ZW5hbnRJZFwiXSk7XG5cbiAgICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgZ2V0VXNlclJvbGVzRnJvbURiKHRlbmFudElkLCB1c2VySWQpO1xuICAgICAgY29uc3QgcmF3Q2FwYWJpbGl0aWVzID0gYXdhaXQgZ2V0Um9sZUNhcGFiaWxpdGllc0JhdGNoKHRlbmFudElkLCByb2xlcyk7XG4gICAgICBjb25zdCBlZmZlY3RpdmVDYXBhYmlsaXRpZXMgPSBleHBhbmRXaWxkY2FyZENhcGFiaWxpdGllcyhyYXdDYXBhYmlsaXRpZXMpO1xuXG4gICAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKFxuICAgICAgICB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgICByb2xlcyxcbiAgICAgICAgICBjYXBhYmlsaXRpZXM6IGVmZmVjdGl2ZUNhcGFiaWxpdGllcyxcbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIDIwMCxcbiAgICAgICAge1xuICAgICAgICAgIFwiU2V0LUNvb2tpZVwiOiBbXG4gICAgICAgICAgICBgYWNjZXNzVG9rZW49JHtBY2Nlc3NUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgICAgIGBpZFRva2VuPSR7SWRUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgICAgIGByZWZyZXNoVG9rZW49JHtSZWZyZXNoVG9rZW59OyBIdHRwT25seTsgU2VjdXJlOyBTYW1lU2l0ZT1Ob25lOyBQYXRoPS87IE1heC1BZ2U9NjA0ODAwYCxcbiAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcIkxvZ2luIGZhaWxlZCB0byBnZXQgaWRUb2tlblwiLCBldmVudCwgNTAwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgaWYgKFxuICAgICAgZXJyLm5hbWUgPT09IFwiTm90QXV0aG9yaXplZEV4Y2VwdGlvblwiIHx8IC8vIHdyb25nIHBhc3N3b3JkXG4gICAgICBlcnIubmFtZSA9PT0gXCJVc2VyTm90Rm91bmRFeGNlcHRpb25cIiAvLyB1c2VyIGRvZXNuJ3QgZXhpc3RcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFwiSW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZFwiLCBldmVudCwgNDAxKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmVycm9yKFwiTG9naW4gZXJyb3I6XCIsIGVycik7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiwgZXZlbnQsIDUwMCk7XG4gIH1cbn07XG4iXX0=