import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import Navbar from "./Navbar";

async function NavbarWithUser() {
  const user = await getCurrentUser();
  return <Navbar user={user} />;
}

export default function SiteNavbar() {
  return (
    <Suspense fallback={<Navbar user={null} loading />}>
      <NavbarWithUser />
    </Suspense>
  );
}
