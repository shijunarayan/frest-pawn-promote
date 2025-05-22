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
        const command = new client_cognito_identity_provider_1.SignUpCommand({
            ClientId: process.env.USER_POOL_CLIENT_ID,
            Username: email,
            Password: password,
        });
        await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User registration successful. Please check your email to verify the account.",
            }),
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || "Registration failed." }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnR0FHbUQ7QUFHbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxnRUFBNkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUU5QyxNQUFNLE9BQU8sR0FBMkIsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQzdELElBQUksQ0FBQztRQUNILE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QixPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLGtDQUFrQyxFQUFFLENBQUM7YUFDcEUsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdEQUFhLENBQUM7WUFDaEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzFDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsUUFBUSxFQUFFLFFBQVE7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTNCLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQ0wsOEVBQThFO2FBQ2pGLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxzQkFBc0IsRUFBRSxDQUFDO1NBQ3ZFLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBaENXLFFBQUEsT0FBTyxXQWdDbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCxcbiAgU2lnblVwQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jb2duaXRvLWlkZW50aXR5LXByb3ZpZGVyXCI7XG5pbXBvcnQgeyBBUElHYXRld2F5UHJveHlIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcblxuY29uc3QgY2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHt9KTtcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5IHx8IFwie31cIik7XG5cbiAgICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkVtYWlsIGFuZCBwYXNzd29yZCBhcmUgcmVxdWlyZWQuXCIgfSksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgU2lnblVwQ29tbWFuZCh7XG4gICAgICBDbGllbnRJZDogcHJvY2Vzcy5lbnYuVVNFUl9QT09MX0NMSUVOVF9JRCEsXG4gICAgICBVc2VybmFtZTogZW1haWwsXG4gICAgICBQYXNzd29yZDogcGFzc3dvcmQsXG4gICAgfSk7XG5cbiAgICBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgXCJVc2VyIHJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCB0byB2ZXJpZnkgdGhlIGFjY291bnQuXCIsXG4gICAgICB9KSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB8fCBcIlJlZ2lzdHJhdGlvbiBmYWlsZWQuXCIgfSksXG4gICAgfTtcbiAgfVxufTtcbiJdfQ==