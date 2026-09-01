import { CalendarClock } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={CalendarClock}
      title="Election Day Operations"
      description="Structured polling-location records: coordinators, poll workers, sign holders, drivers, status and emergency contacts."
    />
  );
}
