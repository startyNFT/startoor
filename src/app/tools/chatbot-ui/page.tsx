import type { Metadata } from "next";
import { ChatbotApp } from "./chatbot-app";

export const metadata: Metadata = {
  title: "Chatbot UI Kit · Try it",
  description:
    "A chatbot UI kit with five distinct themes, live mocked streaming, and copy-ready JSX. Bring your own model — no SDK, no lock-in.",
};

export default function ChatbotUiPage() {
  return <ChatbotApp />;
}
