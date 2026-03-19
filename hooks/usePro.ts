import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export const usePro = () => {
  const [isPro, setIsPro] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const checkProStatus = async () => {
      const { data } = await authClient.customer.subscriptions.list();

      if (data?.result) {
        setIsPro(data?.result.items[0].status === "active" ? true : false);
      }
    };

    checkProStatus();
  }, [session]);

  return { isPro, setIsPro };
};
