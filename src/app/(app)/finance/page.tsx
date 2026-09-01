import { Wallet } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Wallet}
      title="Finance Overview"
      description="Total raised, pledged, spend, payroll and net campaign position across donors, vendors and fundraising events."
    />
  );
}
