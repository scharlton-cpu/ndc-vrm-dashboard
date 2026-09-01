import { Landmark } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Landmark}
      title="Governance"
      description="Role definitions and constituency-scoped access policy. See Users & Roles under Administration to manage accounts."
    />
  );
}
