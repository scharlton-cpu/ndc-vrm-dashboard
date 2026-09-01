import { LineChart } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={LineChart}
      title="Insights"
      description="Deeper electorate and operational analytics beyond the Campaign HQ headline KPIs."
    />
  );
}
