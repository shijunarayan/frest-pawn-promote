import { withTenantContext } from "@/services/utils/withTenantContext";
import { successResponse } from "@/services/auth-service/response";

export const handler = withTenantContext(async () => {
  return successResponse({ isAuthenticated: true });
});
