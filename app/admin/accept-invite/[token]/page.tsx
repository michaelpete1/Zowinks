import { redirect } from "next/navigation";

export default function AdminAcceptInviteLegacyPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }

  const search = query.toString();
  redirect(
    `/admin/auth/accept-invite/${encodeURIComponent(params.token)}${search ? `?${search}` : ""}`,
  );
}
