import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "./login-form";

async function RedirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return null;
}

async function Form({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm errorKey={error} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <Suspense fallback={<LoginForm />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}
