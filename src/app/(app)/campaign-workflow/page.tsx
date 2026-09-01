import { Workflow } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Workflow}
      title="Campaign Workflow"
      description="Strategy, Outreach, Finance, Voter Intelligence, Operations and Election Readiness — objectives, tasks, KPIs, owners and deadlines by pillar."
    />
  );
}
