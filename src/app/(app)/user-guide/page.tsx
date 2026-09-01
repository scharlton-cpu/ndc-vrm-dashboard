import { BookOpen } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={BookOpen}
      title="User Guide"
      description="Searchable in-app documentation covering every module of NDC VRM."
    />
  );
}
