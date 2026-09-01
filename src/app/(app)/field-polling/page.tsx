import { MapPinned } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={MapPinned}
      title="Field & Polling"
      description="Today's field activity, active canvassers, walk lists, turf management and survey responses."
    />
  );
}
