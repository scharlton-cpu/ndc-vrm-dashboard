import { Cog } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Cog}
      title="Automation"
      description="Rules engine for administrative and operational tasks — draft, dry run, review, activation, with a full audit trail."
    />
  );
}
