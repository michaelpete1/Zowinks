import { redirect } from "next/navigation";

export default function AdminAcceptInviteRedirectPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = Array.isArray(searchParams.token)
    ? searchParams.token[0]
    : searchParams.token;

  if (token) {
    redirect(`/admin/auth/accept-invite/${encodeURIComponent(token)}`);
  }

  redirect(`/admin/auth/accept-invite`);
}
