import { redirect } from "next/navigation";

export default async function AdminResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      params.set(key, value[0]);
    }
  }

  const destination = `/admin/auth/reset-password${params.toString() ? `?${params.toString()}` : ""}`;
  redirect(destination);
}
