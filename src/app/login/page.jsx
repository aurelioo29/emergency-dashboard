import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import LoginPageClient from "./login-page-client";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session && session.accessToken && !session.error) {
    redirect("/dashboard");
  }

  return <LoginPageClient />;
}
