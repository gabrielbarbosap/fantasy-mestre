/** E-mail do usuário administrador — único com acesso às funções admin */
const ADMIN_EMAIL = "gabriel@sistemap.com.br";

export function isAdmin(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
