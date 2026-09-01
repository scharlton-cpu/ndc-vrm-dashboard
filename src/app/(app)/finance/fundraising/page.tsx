import { PiggyBank } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={PiggyBank}
      title="Fundraising Events"
      description="Event goals, amounts raised, expenses, net raised and attendance."
    />
  );
}
