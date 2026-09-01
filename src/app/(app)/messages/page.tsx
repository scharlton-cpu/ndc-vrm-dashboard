import { MessagesSquare } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={MessagesSquare}
      title="Messages"
      description="Internal campaign inbox: notifications, approvals, system alerts, finance and field alerts, and the shared campaign team channel."
    />
  );
}
