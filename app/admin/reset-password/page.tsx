import { redirect } from "next/navigation";

export default function AdminResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      params.set(key, value[0]);
    }
  }

  const destination = `/admin/auth/reset-password${params.toString() ? `?${params.toString()}` : ""}`;
  redirect(destination);
}
