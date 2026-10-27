import { redirect } from "next/navigation";

export default async function AdminAcceptInviteLegacyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ token }, resolvedSearchParams = {}] = await Promise.all([
    params,
    searchParams,
  ]);
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }

  const search = query.toString();
  redirect(
    `/admin/auth/accept-invite/${encodeURIComponent(token)}${search ? `?${search}` : ""}`,
  );
}
