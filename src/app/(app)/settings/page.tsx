import { Settings } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Settings}
      title="Settings"
      description="Account and application settings."
    />
  );
}
