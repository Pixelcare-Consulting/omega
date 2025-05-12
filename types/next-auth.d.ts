import { DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

type UserSettings = {
  systemSettings?: {
    twoFactorEnabled?: boolean;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
  dashboardSettings?: Record<string, any>;
  roleSettings?: Record<string, any>;
};

type ExtendedUser = DefaultUser & {
  id: string;
  role?: string;
  settings?: UserSettings;
  email: string;
  name?: string | null;
  image?: string | null;
};

declare module "next-auth" {
  interface User extends ExtendedUser {}
  
  interface Session {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends ExtendedUser {}
} 