import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAdmin } from "./actions";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminIndexPage() {
  if (await checkAdmin()) {
    redirect("/admin/applications");
  }
  return (
    <div className="border-t border-hairline">
      <div className="mx-auto max-w-md px-6 py-24 md:py-32">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
          Restricted
        </span>
        <h1 className="mt-4 font-display text-5xl leading-[0.92] tracking-tight text-ink">
          Admin.
        </h1>
        <p className="mt-5 font-sans text-sm text-ink-soft">
          Enter the admin password to review seller applications.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
