"use client";

import { usePathname } from "next/navigation";

export default function HideOnRoutes({
  routes,
  children,
}: {
  routes: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hidden = routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return hidden ? null : <>{children}</>;
}
