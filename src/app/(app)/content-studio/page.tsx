import { Newspaper } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={Newspaper}
      title="Content Studio"
      description="Campaign content calendar, drafts, approval queue, approved and published content, and content performance."
    />
  );
}
