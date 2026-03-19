"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { CreditCard, Crown, User, Video } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserButton } from "@daveyplate/better-auth-ui";
import { usePro } from "@/hooks/usePro";

export const DashboardNavbar = () => {
  const { isPro } = usePro();
  const session = authClient.useSession();

  return (
    <header className="bg-white border-b w-full h-16 flex flex-col shadow-sm justify-center">
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between w-full">
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative w-10 h-10">
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="video ai logo"
                  fill
                  className="object-cover"
                />
              </Link>
            </div>

            {session?.data?.user.id && (
              <>
                <Link href="/dashboard">
                  <Button
                    className="bg-none border-none pl-8"
                    variant="outline"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={async () => await authClient.customer.portal()}
                  variant="outline"
                  className="bg-none border-none pl-8"
                >
                  <CreditCard />
                  Billing and Subscriptions
                </Button>
              </>
            )}
          </div>

          {session.data?.user.id ? (
            <div className="flex items-center gap-4">
              {!isPro && (
                <Button
                  className="flex gap-4 items-center"
                  onClick={async () => {
                    await authClient.checkout({
                      slug: "videoai-pro",
                    });
                  }}
                >
                  <Crown />
                  Upgrad to pro
                </Button>
              )}
              <Link href="/dashboard/generate">
                <Button className="flex gap-4 items-center">
                  <Video />
                  New video
                </Button>
              </Link>

              <UserButton className="bg-blue-500 hover:bg-blue-500/90 h-9 cursor-pointer" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/sign-in">
                <Button className="flex gap-4 items-center">
                  <User />
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
