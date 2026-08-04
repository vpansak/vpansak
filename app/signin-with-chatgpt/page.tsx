import { redirect } from "next/navigation";

export default async function SignInWithChatGPTPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || "/account";
  redirect(`/signin?return_to=${encodeURIComponent(returnTo)}`);
}
