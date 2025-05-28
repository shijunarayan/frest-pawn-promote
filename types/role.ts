export interface Role {
  tenantId: string;
  roleId: string;
  description: string;
  isSystem: boolean;
  capabilities: string[];
  createdAt: string;
  createdById: string;
  modifiedAt: string;
  modifiedById: string;
}
