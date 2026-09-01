import { CalendarCheck2 } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={CalendarCheck2}
      title="Election Readiness"
      description="Polling division coverage, poll worker and sign holder assignment, transportation, and overall readiness percentage."
    />
  );
}
