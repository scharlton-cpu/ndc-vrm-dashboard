import { UserCog } from "lucide-react";
import { StubPage } from "@/components/shared/stub-page";

export default function Page() {
  return (
    <StubPage
      icon={UserCog}
      title="Users & Roles"
      description="Manage accounts, roles and constituency-scoped access. Seeded demo accounts are listed on the sign-in page."
    />
  );
}
