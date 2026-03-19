import { AuthSkeleton } from "@/components/auth-skeleton";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import {
  AuthLoading,
  RedirectToSignIn,
  SignedIn,
} from "@daveyplate/better-auth-ui";

export default function DashboardLyout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLoading>
        <AuthSkeleton />
      </AuthLoading>
      <RedirectToSignIn />
      <SignedIn>
        <DashboardNavbar />
        {children}
      </SignedIn>
    </>
  );
}
