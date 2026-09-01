import { ShieldAlert } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={ShieldAlert}
      title="Risk Register"
      description="Operational campaign risks: severity, probability, impact, owner and mitigation status."
    />
  );
}
