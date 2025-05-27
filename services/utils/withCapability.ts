import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse } from "@/services/auth-service/response";
import { hasCapability } from "./accessControl";
import { CapabilityId } from "@/services/access-control/constants/capabilities";
import { TenantContext } from "@/types/context";

export function withCapability(
  requiredCapability: CapabilityId,
  handler: (
    event: APIGatewayProxyEvent,
    context: TenantContext
  ) => Promise<APIGatewayProxyResult>
) {
  return async (event: APIGatewayProxyEvent, context: TenantContext) => {
    const { tenantId, userId } = context;

    const allowed = await hasCapability(tenantId, userId, requiredCapability);
    if (!allowed) {
      return errorResponse("Forbidden", 403);
    }

    return handler(event, context);
  };
}
