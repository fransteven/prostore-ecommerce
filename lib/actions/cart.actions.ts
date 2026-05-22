"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject } from "../utils";
import { cartItemSchema } from "../validators";

export const addItemToCart = async (data: CartItem) => {
  try {
    //Check for cart cookie (SESSION CART)
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session id not found");

    //Get session and user ID (SESSION USER)
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //Get cart
    const cart = await getMyCart()

    //Parse and Validate item
    const item = cartItemSchema.parse(data);

    //Find product in database
    const product = await prisma.product.findFirst({
        where: {id: item.productId}
    })

    //Testing
    console.log({
      "Session Cart ID": sessionCartId,
      "User ID": userId,
      "Item Requested": item,
      "Product": product,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return { success: false, message: "Something went wrong!" };
  }
  return { success: true, message: "Item added to cart" };
};

export const getMyCart = async () => {
  //Check for cart cookie (SESSION CART)
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session id not found");

  //Get session and user ID (SESSION USER)
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //GET user cart from database or object with sessionCartId
  const cart = await prisma.cart.findFirst(
    {
        where: userId ? {userId} : {sessionCartId}
    }
  )

  if(!cart)return undefined

  //Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  })

};
