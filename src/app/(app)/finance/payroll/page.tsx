import { Banknote } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Banknote}
      title="Employee Payments"
      description="Payroll by pay period, role and payment status."
    />
  );
}
