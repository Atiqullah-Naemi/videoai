import { DashboardNavbar } from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for tyring out VideoAI",
    features: [
      "5 vides per month",
      "720 export quality",
      "Basic templates",
      "Watermark on export",
      "Community support",
    ],
    cta: "Get started",
  },

  {
    name: "Pro",
    price: "$19.99",
    description: "For creators who need more power",
    period: "/month",
    features: [
      "Unlimited vides",
      "4k export quality",
      "Pro templates",
      "No watermark on export",
      "Priority support",
    ],
    cta: "Get started",
  },
];

export default function Page() {
  return (
    <>
      <DashboardNavbar />
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="inset-0 -z-10">
            <div
              className="
            inset-0 
            bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px), linear_gradient(to_bottom,#1a1a1a_1px,transparent_1px)]
            bg-size-[4rem_4rem]
            mask-[radial-gradient(ellips_60%_50%_at_50%_0%,#000_70%,transparent_110%)]
          "
            >
              <div
                className="
            absolute left-1/2 top-0 -z-10 h-150 w-150 -translate-x-1/2 rounded-full 
            bg-accent/10 blur-[120px]"
              />

              <div className="mx-auto max-w-7xl px-6 text-center">
                <h1
                  className="mx-auto max-w-7xl text-balance text-4xl font-bold 
                tracking-tight text-foreground
                "
                >
                  Create stunning videos with{" "}
                  <span className="text-blue-500">AI matic</span>
                </h1>
                <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
                  Transform your ideas into professional videos in minutes. Just
                  describe what you want, and let our AI handle the rest. No
                  editing skills required.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <Button
                    className="gap-2 bg-blue-500 text-background flex items-center justify-between"
                    size="lg"
                  >
                    Start creating
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">
                Simple, transparent pricing
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Start free and scale you grow. No hidden fess, no surprise.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="relative rounded-xl border p-8 border-border bg-card"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm">
                          <Check />
                          <span className="text-muted-foreground"> {f} </span>
                        </li>
                      ))}
                    </ul>

                    <Button className="mt-8 w-full bg-secondary text-foreground">
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
