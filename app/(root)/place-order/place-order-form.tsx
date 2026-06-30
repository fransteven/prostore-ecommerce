"use client";

import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order.actions";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFormStatus } from "react-dom";

export default function PlaceOrderForm() {
  const router = useRouter();
  const handleSubmit = async ()=>{
    const res = await createOrder()
    if(res.redirectTo){
        router.push(res.redirectTo)
    }
  }
  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )} {' '} Place Order
      </Button>
    );
  };

  return (
    <form action={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  );
}
