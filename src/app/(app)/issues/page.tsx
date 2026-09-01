import { ClipboardList } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={ClipboardList}
      title="Issue Register"
      description="Aggregated constituent issues by category, constituency, severity and status, with drill-down into related reports."
    />
  );
}
