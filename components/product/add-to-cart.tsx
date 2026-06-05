"use client";
import { Cart, CartItem } from "@/types";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

function AddToCart({ cart, item }: { cart?: Cart; item: CartItem }) {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message, {
      action: (
        <Button
          className="bg-primary text-white cursor-pointer hover:bg-gray-800 "
          onClick={() => router.push("/cart")}
        >
          Go to Cart
        </Button>
      ),
    });
  };

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    const res = await removeItemFromCart(item.productId);
    toast.success(res.message);
    return;
  };

  // Check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button
      className="w-full cursor-pointer"
      type="button"
      onClick={handleAddToCart}
    >
      Add to Cart
    </Button>
  );
}

export default AddToCart;
