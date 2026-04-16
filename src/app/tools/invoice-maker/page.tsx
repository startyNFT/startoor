import type { Metadata } from "next";
import { InvoiceMakerApp } from "./invoice-maker-app";

export const metadata: Metadata = {
  title: "Invoice Maker · Try it",
  description: "Send a beautifully typeset invoice in 30 seconds. Live preview, one-click PDF.",
};

export default function InvoiceMakerPage() {
  return <InvoiceMakerApp />;
}
