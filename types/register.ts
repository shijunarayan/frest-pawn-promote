export type RegisterRequest = {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  requirePasswordReset?: boolean;
  sendInvite?: boolean;
  roles: string[];
};
