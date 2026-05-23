import { auth } from "@/lib/auth";
import {
  EditorialShell,
  EditorialNav,
  EditorialFooter,
} from "@/components/landing";

export default async function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return (
    <EditorialShell>
      <EditorialNav
        state={{ loggedIn: isLoggedIn, destinationHref: "/dashboard" }}
      />
      {children}
      <EditorialFooter />
    </EditorialShell>
  );
}
