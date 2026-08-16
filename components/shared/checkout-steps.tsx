
import { cn } from "@/lib/utils";
import { Check, User, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import React from "react";

const steps = [
  { name: "User Login", icon: User },
  { name: "Shipping Address", icon: MapPin },
  { name: "Payment Method", icon: CreditCard },
  { name: "Place Order", icon: ShoppingBag },
];

function CheckoutSteps({ current = 0 }: { current?: number }) {
  return (
    <nav aria-label="Checkout Progress" className="mb-8">
      <ol className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.name}>
              <li className="flex flex-col sm:flex-row items-center gap-2 group flex-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex size-9 sm:size-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 shadow-xs",
                      isCompleted &&
                        "bg-emerald-600 text-white dark:bg-emerald-500",
                      isCurrent &&
                        "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-muted text-muted-foreground border border-border/80"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="size-4" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span
                      className={cn(
                        "text-xs font-medium block uppercase tracking-wider",
                        isCurrent
                          ? "text-primary font-semibold"
                          : isCompleted
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      Step {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent
                          ? "text-foreground font-semibold"
                          : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                </div>
                <span className="sm:hidden text-[11px] font-medium text-center line-clamp-1 mt-1">
                  {step.name}
                </span>
              </li>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-0.5 flex-1 mx-3 rounded-full transition-colors",
                    index < current ? "bg-emerald-600/70 dark:bg-emerald-500/70" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default CheckoutSteps;

