"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
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
        return (0, response_1.successResponse)({ success: true }, event, 200, {
            "Set-Cookie": [
                `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
            ],
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTREO0FBRTVELE1BQU0sTUFBTSxHQUFHLElBQUksZ0VBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQTJCLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3RCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztRQUU5RCxNQUFNLE9BQU8sR0FBRyxJQUFJLHNEQUFtQixDQUFDO1lBQ3RDLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzFDLGNBQWMsRUFBRTtnQkFDZCxRQUFRLEVBQUUsUUFBUTtnQkFDbEIsUUFBUSxFQUFFLFFBQVE7YUFDbkI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNaLE9BQU8sSUFBQSx3QkFBYSxFQUNsQiwwQ0FBMEMsRUFDMUMsS0FBSyxFQUNMLEdBQUcsQ0FDSixDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUN0RCxPQUFPLElBQUEsMEJBQWUsRUFBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3BELFlBQVksRUFBRTtnQkFDWixlQUFlLFdBQVcseURBQXlEO2dCQUNuRixXQUFXLE9BQU8seURBQXlEO2dCQUMzRSxnQkFBZ0IsWUFBWSwyREFBMkQ7YUFDeEY7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUNsQixJQUNFLEdBQUcsQ0FBQyxJQUFJLEtBQUssd0JBQXdCLElBQUksaUJBQWlCO1lBQzFELEdBQUcsQ0FBQyxJQUFJLEtBQUssdUJBQXVCLENBQUMscUJBQXFCO1VBQzFELENBQUM7WUFDRCxPQUFPLElBQUEsd0JBQWEsRUFBQyw4QkFBOEIsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sSUFBQSx3QkFBYSxFQUFDLHVCQUF1QixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1RCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBM0NXLFFBQUEsT0FBTyxXQTJDbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gIENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LFxuICBJbml0aWF0ZUF1dGhDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNvZ25pdG8taWRlbnRpdHktcHJvdmlkZXJcIjtcbmltcG9ydCB7IHN1Y2Nlc3NSZXNwb25zZSwgZXJyb3JSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7fSk7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBBUElHYXRld2F5UHJveHlIYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCBcInt9XCIpO1xuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbml0aWF0ZUF1dGhDb21tYW5kKHtcbiAgICAgIEF1dGhGbG93OiBcIlVTRVJfUEFTU1dPUkRfQVVUSFwiLFxuICAgICAgQ2xpZW50SWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQhLFxuICAgICAgQXV0aFBhcmFtZXRlcnM6IHtcbiAgICAgICAgVVNFUk5BTUU6IHVzZXJuYW1lLFxuICAgICAgICBQQVNTV09SRDogcGFzc3dvcmQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgY29uc3QgdG9rZW5zID0gcmVzdWx0LkF1dGhlbnRpY2F0aW9uUmVzdWx0O1xuXG4gICAgaWYgKCF0b2tlbnMpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFxuICAgICAgICBcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDogTWlzc2luZyB0b2tlbiBzZXRcIixcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIDQwMVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IEFjY2Vzc1Rva2VuLCBJZFRva2VuLCBSZWZyZXNoVG9rZW4gfSA9IHRva2VucztcbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9LCBldmVudCwgMjAwLCB7XG4gICAgICBcIlNldC1Db29raWVcIjogW1xuICAgICAgICBgYWNjZXNzVG9rZW49JHtBY2Nlc3NUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgYGlkVG9rZW49JHtJZFRva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9Tm9uZTsgUGF0aD0vOyBNYXgtQWdlPTM2MDBgLFxuICAgICAgICBgcmVmcmVzaFRva2VuPSR7UmVmcmVzaFRva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9Tm9uZTsgUGF0aD0vOyBNYXgtQWdlPTYwNDgwMGAsXG4gICAgICBdLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIGlmIChcbiAgICAgIGVyci5uYW1lID09PSBcIk5vdEF1dGhvcml6ZWRFeGNlcHRpb25cIiB8fCAvLyB3cm9uZyBwYXNzd29yZFxuICAgICAgZXJyLm5hbWUgPT09IFwiVXNlck5vdEZvdW5kRXhjZXB0aW9uXCIgLy8gdXNlciBkb2Vzbid0IGV4aXN0XG4gICAgKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcIkludmFsaWQgdXNlcm5hbWUgb3IgcGFzc3dvcmRcIiwgZXZlbnQsIDQwMSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIkxvZ2luIGVycm9yOlwiLCBlcnIpO1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFwiSW50ZXJuYWwgc2VydmVyIGVycm9yXCIsIGV2ZW50LCA1MDApO1xuICB9XG59O1xuIl19