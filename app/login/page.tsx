import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "./login-form";

async function RedirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return null;
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <LoginForm />
    </>
  );
}
