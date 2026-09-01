import { HeartHandshake } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={HeartHandshake}
      title="Donors"
      description="Donor tiers, pledged and received amounts, outstanding balances, and lawful campaign-finance controls."
    />
  );
}
