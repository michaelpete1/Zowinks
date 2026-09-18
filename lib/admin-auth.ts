import { useAdminSession } from "../hooks/useAdminSession";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

export function persistAdminAuth(
  sessionTools: ReturnType<typeof useAdminSession>,
  accessToken: string,
  user: { id: string; firstName: string; lastName: string; email: string },
) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, accessToken);
  }
  sessionTools.signInAdmin(
    `${user.firstName} ${user.lastName}`.trim() || "Admin",
    user.email,
    accessToken,
    user.id,
  );
}
