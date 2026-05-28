"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, round2 } from "../utils";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// Calculate cart Prices
const calcPrice = (items: CartItem[]) =>{
  const itemsPrice = round2(items.reduce((acc, item)=>acc + Number(item.price)*item.qty, 0)),
  shippingPrice = round2(itemsPrice >100?0:10),
  taxPrice = round2(0.15 * itemsPrice),
  totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

  return{
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2)}
}

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

    if(!product) throw new Error("Product not found")

    if(!cart){
      // Create new cart object
      const newCart = insertCartSchema.parse({
        userId:userId,
        sessionCartId:sessionCartId,
        items: [item],
        ...calcPrice([item])
      })
      // Add to database
      await prisma.cart.create({data: newCart as Prisma.CartUncheckedCreateInput})
      // Revalidate product page
      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} added to cart`
      }
    }else{

    }

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
