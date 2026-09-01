import { Radio } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Radio}
      title="Channels"
      description="Broadcast and direct communication channels. Direct communication respects consent and suppression status."
    />
  );
}
