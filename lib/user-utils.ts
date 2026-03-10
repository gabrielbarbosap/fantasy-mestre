import { isAdmin } from "./admin";

export function isUserPremium(email: string | null | undefined, isPremium?: boolean): boolean {
  return !!isPremium || isAdmin(email);
}
