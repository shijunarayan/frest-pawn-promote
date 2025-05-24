"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const handler = async (event) => {
    try {
        const { username, password, email, phone, requirePasswordReset, sendInvite, } = JSON.parse(event.body || "{}");
        const userAttributes = [
            ...(email ? [{ Name: "email", Value: email }] : []),
            ...(phone ? [{ Name: "phone_number", Value: phone }] : []),
        ];
        const createCommand = new client_cognito_identity_provider_1.AdminCreateUserCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
            MessageAction: sendInvite ? undefined : "SUPPRESS",
            UserAttributes: userAttributes,
        });
        await client.send(createCommand);
        if (!sendInvite) {
            const passwordCommand = new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: username,
                Password: password,
                Permanent: !requirePasswordReset,
            });
            await client.send(passwordCommand);
        }
        return (0, response_1.successResponse)({ message: "User created successfully" });
    }
    catch (err) {
        console.error("Register error:", err);
        return (0, response_1.errorResponse)(err);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FJbUQ7QUFDbkQseUNBQTREO0FBRTVELE1BQU0sTUFBTSxHQUFHLElBQUksZ0VBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQTJCLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3RCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQ0osUUFBUSxFQUNSLFFBQVEsRUFDUixLQUFLLEVBQ0wsS0FBSyxFQUNMLG9CQUFvQixFQUNwQixVQUFVLEdBQ1gsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFbkMsTUFBTSxjQUFjLEdBQUc7WUFDckIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzNELENBQUM7UUFFRixNQUFNLGFBQWEsR0FBRyxJQUFJLHlEQUFzQixDQUFDO1lBQy9DLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQWE7WUFDckMsUUFBUSxFQUFFLFFBQVE7WUFDbEIsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ2xELGNBQWMsRUFBRSxjQUFjO1NBQy9CLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDaEIsTUFBTSxlQUFlLEdBQUcsSUFBSSw4REFBMkIsQ0FBQztnQkFDdEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBYTtnQkFDckMsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixTQUFTLEVBQUUsQ0FBQyxvQkFBb0I7YUFDakMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxPQUFPLElBQUEsMEJBQWUsRUFBQyxFQUFFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7QUFDSCxDQUFDLENBQUM7QUF6Q1csUUFBQSxPQUFPLFdBeUNsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtcbiAgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQsXG4gIEFkbWluQ3JlYXRlVXNlckNvbW1hbmQsXG4gIEFkbWluU2V0VXNlclBhc3N3b3JkQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jb2duaXRvLWlkZW50aXR5LXByb3ZpZGVyXCI7XG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZVwiO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQoe30pO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlcjogQVBJR2F0ZXdheVByb3h5SGFuZGxlciA9IGFzeW5jIChldmVudCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBlbWFpbCxcbiAgICAgIHBob25lLFxuICAgICAgcmVxdWlyZVBhc3N3b3JkUmVzZXQsXG4gICAgICBzZW5kSW52aXRlLFxuICAgIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkgfHwgXCJ7fVwiKTtcblxuICAgIGNvbnN0IHVzZXJBdHRyaWJ1dGVzID0gW1xuICAgICAgLi4uKGVtYWlsID8gW3sgTmFtZTogXCJlbWFpbFwiLCBWYWx1ZTogZW1haWwgfV0gOiBbXSksXG4gICAgICAuLi4ocGhvbmUgPyBbeyBOYW1lOiBcInBob25lX251bWJlclwiLCBWYWx1ZTogcGhvbmUgfV0gOiBbXSksXG4gICAgXTtcblxuICAgIGNvbnN0IGNyZWF0ZUNvbW1hbmQgPSBuZXcgQWRtaW5DcmVhdGVVc2VyQ29tbWFuZCh7XG4gICAgICBVc2VyUG9vbElkOiBwcm9jZXNzLmVudi5VU0VSX1BPT0xfSUQhLFxuICAgICAgVXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgTWVzc2FnZUFjdGlvbjogc2VuZEludml0ZSA/IHVuZGVmaW5lZCA6IFwiU1VQUFJFU1NcIixcbiAgICAgIFVzZXJBdHRyaWJ1dGVzOiB1c2VyQXR0cmlidXRlcyxcbiAgICB9KTtcblxuICAgIGF3YWl0IGNsaWVudC5zZW5kKGNyZWF0ZUNvbW1hbmQpO1xuXG4gICAgaWYgKCFzZW5kSW52aXRlKSB7XG4gICAgICBjb25zdCBwYXNzd29yZENvbW1hbmQgPSBuZXcgQWRtaW5TZXRVc2VyUGFzc3dvcmRDb21tYW5kKHtcbiAgICAgICAgVXNlclBvb2xJZDogcHJvY2Vzcy5lbnYuVVNFUl9QT09MX0lEISxcbiAgICAgICAgVXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICBQYXNzd29yZDogcGFzc3dvcmQsXG4gICAgICAgIFBlcm1hbmVudDogIXJlcXVpcmVQYXNzd29yZFJlc2V0LFxuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IGNsaWVudC5zZW5kKHBhc3N3b3JkQ29tbWFuZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZSh7IG1lc3NhZ2U6IFwiVXNlciBjcmVhdGVkIHN1Y2Nlc3NmdWxseVwiIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiUmVnaXN0ZXIgZXJyb3I6XCIsIGVycik7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyKTtcbiAgfVxufTtcbiJdfQ==