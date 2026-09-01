import { Bot } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Bot}
      title="Agent Workspace"
      description="Governed AI assistant for internal analytics — cites underlying records, distinguishes facts from estimates, and respects permissions."
    />
  );
}
