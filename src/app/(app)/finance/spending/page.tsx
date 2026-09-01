import { Receipt } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Receipt}
      title="Spending & Accounting"
      description="Expense approvals, spend by category, and pending vs paid status."
    />
  );
}
