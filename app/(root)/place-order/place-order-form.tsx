"use client";

import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order.actions";
import { Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

export default function PlaceOrderForm() {
  const router = useRouter();

  const handleSubmit = async () => {
    const res = await createOrder();
    if (!res.success) {
      toast.error(res.message);
    }
    if (res.redirectTo) {
      router.push(res.redirectTo);
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending}
        className="w-full gap-2 shadow-xs py-5 text-sm sm:text-base font-semibold cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Placing Order...</span>
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" />
            <span>Place Order Now</span>
          </>
        )}
      </Button>
    );
  };

  return (
    <form action={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  );
}
