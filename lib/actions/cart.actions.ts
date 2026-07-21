"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { CartItem, PaymentResult } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { paypal } from "../paypal";

// Calculate cart Prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const addItemToCart = async (data: CartItem) => {
  try {
    //Check for cart cookie (SESSION CART)
    let sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      sessionCartId = crypto.randomUUID();
      (await cookies()).set("sessionCartId", sessionCartId);
    }

    //Get session and user ID (SESSION USER)
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //Get cart
    const cart = await getMyCart();

    //Parse and Validate item
    const item = cartItemSchema.parse(data);

    //Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      // Create new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        sessionCartId: sessionCartId,
        items: [item],
        ...calcPrice([item]),
      });
      // Add to database
      await prisma.cart.create({
        data: newCart as Prisma.CartUncheckedCreateInput,
      });
      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // Check if item is already in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId,
      );

      if (existItem) {
        // Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        // Increase the quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId,
        )!.qty = existItem.qty + 1;
      } else {
        // If items does not exist in cart
        // Check stock
        if (product.stock < 1) throw new Error("Not enough stock");

        // Add item to cart
        cart.items.push(item);
      }

      // Save to the database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${existItem ? "updated in" : "added to"} cart`,
      };
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
  if (!sessionCartId) return undefined;

  //Get session and user ID (SESSION USER)
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //GET user cart from database or object with sessionCartId
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });

  if (!cart) return undefined;

  //Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
};

export const removeItemFromCart = async (productId: string) => {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Check for item
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === product.id,
    );

    if (!exist) throw new Error("Item not in cart");

    if (exist.qty === 1) {
      // Remove from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId,
      );
    } else {
      // Decrease qty
      exist.qty -= 1;
    }
    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: `${product.name} was remove from cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const approvePayPalOrder = async (
  orderId: string,
  data: { orderID: string },
) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error in PayPal payment");
    }

    await updateOrderToPaid({orderId, paymentResult :{
      id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,
      pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value
    }})

    // Revalidate the path for update state of paid
    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been paid",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// Upadate order to paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include:{
      orderitems: true
    }
  });

  if (!order) throw new Error("Order not found");

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx)=>{
    for (const item of order.orderitems){
      await tx.product.update({
        where: {id: item.productId},
        data: {stock: {increment:-item.qty}}
      })
    }
    // Set the order to paid
    await tx.order.update({
      where:{id: orderId},
      data:{
        isPaid: true,
        paidAt: new Date(),
        paymentResult
      }
    })
  })

  // Get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: {id: orderId},
    include: {
      orderitems: true,
      user: {select: {name: true, email:true}}
    }
  })
  if(!updatedOrder) throw new Error('Order not found')
}
