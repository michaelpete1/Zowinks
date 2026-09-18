import { redirect } from "next/navigation";

export default async function AdminAcceptInviteRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (token) {
    redirect(`/admin/auth/accept-invite/${encodeURIComponent(token)}`);
  }

  redirect(`/admin/auth/accept-invite`);
}
