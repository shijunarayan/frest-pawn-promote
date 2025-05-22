"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const handler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body || "{}");
        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email and password are required." }),
            };
        }
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.USER_POOL_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });
        const response = await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Login successful",
                tokens: response.AuthenticationResult,
            }),
        };
    }
    catch (err) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: err.message || "Login failed.",
            }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnR0FHbUQ7QUFHbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxnRUFBNkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUU5QyxNQUFNLE9BQU8sR0FBMkIsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQzdELElBQUksQ0FBQztRQUNILE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QixPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLGtDQUFrQyxFQUFFLENBQUM7YUFDcEUsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHNEQUFtQixDQUFDO1lBQ3RDLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzFDLGNBQWMsRUFBRTtnQkFDZCxRQUFRLEVBQUUsS0FBSztnQkFDZixRQUFRLEVBQUUsUUFBUTthQUNuQjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsT0FBTyxFQUFFLGtCQUFrQjtnQkFDM0IsTUFBTSxFQUFFLFFBQVEsQ0FBQyxvQkFBb0I7YUFDdEMsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUNsQixPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLElBQUksZUFBZTthQUN0QyxDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDLENBQUM7QUFyQ1csUUFBQSxPQUFPLFdBcUNsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LFxuICBJbml0aWF0ZUF1dGhDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNvZ25pdG8taWRlbnRpdHktcHJvdmlkZXJcIjtcbmltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQoe30pO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlcjogQVBJR2F0ZXdheVByb3h5SGFuZGxlciA9IGFzeW5jIChldmVudCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkgfHwgXCJ7fVwiKTtcblxuICAgIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiRW1haWwgYW5kIHBhc3N3b3JkIGFyZSByZXF1aXJlZC5cIiB9KSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbml0aWF0ZUF1dGhDb21tYW5kKHtcbiAgICAgIEF1dGhGbG93OiBcIlVTRVJfUEFTU1dPUkRfQVVUSFwiLFxuICAgICAgQ2xpZW50SWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQhLFxuICAgICAgQXV0aFBhcmFtZXRlcnM6IHtcbiAgICAgICAgVVNFUk5BTUU6IGVtYWlsLFxuICAgICAgICBQQVNTV09SRDogcGFzc3dvcmQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1lc3NhZ2U6IFwiTG9naW4gc3VjY2Vzc2Z1bFwiLFxuICAgICAgICB0b2tlbnM6IHJlc3BvbnNlLkF1dGhlbnRpY2F0aW9uUmVzdWx0LFxuICAgICAgfSksXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAxLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UgfHwgXCJMb2dpbiBmYWlsZWQuXCIsXG4gICAgICB9KSxcbiAgICB9O1xuICB9XG59O1xuIl19