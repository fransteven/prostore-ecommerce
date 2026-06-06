"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart } from "@/types";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function CartTable({ cart }: { cart?: Cart }) {
  const router = useRouter();
  const [isPending, setTransition] = useTransition();
  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shipping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="over-flow-auto md:col-span-3">Table</div>
        </div>
      )}
    </>
  );
}

export default CartTable;
