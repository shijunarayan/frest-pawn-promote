import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { getTenantContext } from "./tokenUtils";
import { TenantContext } from "@/types/context";
import { errorResponse } from "@/services/auth-service/response";

export function withTenantContext(
  handler: (event: APIGatewayProxyEvent, context: TenantContext) => Promise<any>
): APIGatewayProxyHandler {
  return async (event) => {
    try {
      const tenantContext = await getTenantContext(event);

      if (!tenantContext) {
        return errorResponse("Unauthorized or missing tenant info", 401);
      }

      return await handler(event, tenantContext);
    } catch (err: any) {
      console.error("Unhandled error in Lambda handler:", err);
      return errorResponse("Internal Server Error", 500);
    }
  };
}
