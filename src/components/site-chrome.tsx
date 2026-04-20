"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicBio = pathname.startsWith("/bio/");
  const isPublicPortfolio = pathname.startsWith("/portfolio/");
  const isTemplatePreview = pathname.startsWith("/templates/");
  if (isPublicBio || isPublicPortfolio || isTemplatePreview) {
    return <>{children}</>;
  }
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
