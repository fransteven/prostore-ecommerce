"use server"

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { success } from "zod";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";

export const createOrder = async () => {
  try {
    const session = await auth();

    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();

    const userId = session.user?.id;

    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if(!cart || cart.items.length === 0){
        return {success: false, message: "Your cart is empty", redirectTo:"/cart"}
    }
    if(!user.address){
        return {success: false, message: "No shipping address", redirectTo:"/shipping-address"}
    }
    if(!user.paymentMethod){
        return {success: false, message: "No payment method", redirectTo:"/payment-method"}
    }

    // Create order object
    const order = insertOrderSchema.parse({
        userId:user.id,
        shippingAddress:user.address,
        paymentMethod:user.paymentMethod,
        itemsPrice:cart.itemsPrice,
        shippingPrice:cart.shippingPrice,
        taxPrice:cart.taxPrice,
        totalPrice:cart.totalPrice,
    })

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx)=>{
        // Create order
        const insertedOrder = await tx.order.create({data:order})

        // Create order items from the cart items
        for (const item of cart.items as CartItem[]){
            await tx.orderItem.create({
                data:{
                    ...item,
                    price: item.price,
                    orderId: insertedOrder.id
                }
            })
        }

        // Clear the cart
        await tx.cart.update({
            where: {id: cart.id},
            data:{
                items:[],
                totalPrice:0,
                taxPrice:0,
                shippingPrice:0,
                itemsPrice:0,
            }
        })

        return insertedOrder.id
    })

    if(!insertedOrderId) throw new Error("Order not created")

    return {success:true, message:"Order created", redirectTo:`/order/${insertedOrderId}`}

  } catch (error) {
    if (isRedirectError(error)) throw new Error(error.message);
    return {
      success: false,
      message: formatError(error),
    };
  }
};


export const getOrderById = async (orderId:string)=>{
    const data  = await prisma.order.findFirst({
        where: {id:orderId},
        include:{
            orderitems: true,
            user:{select:{name:true, email:true}}
        }
    })
    return convertToPlainObject(data)
}


export const createPaypalOrder = async (orderId:string) => {
    try {
        // Get order from database
        const order = await prisma.order.findFirst({
            where: {id: orderId}
        })
        if(order){
            // Create paypal order
            const payplaOrder = await paypal.createOrder(Number(order.totalPrice))

            await prisma.order.update({
                where: {id: order.id},
                data:{
                    paymentResult:{
                        id: payplaOrder.id,
                        email_address:'',
                        status: '',
                        pricePaid: 0,
                    }
                }
            })

            return {
                success: true,
                message: 'Item order created successfully',
                data: payplaOrder.id
            }
        }
        else{
            throw new Error('Order not found')
        }

    } catch (error) {
        return {success:false, message:formatError(error)}
    }
}


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
        email_address: captureData.payer?.email_address ?? '',
        pricePaid: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? '0'
      }})

      // Revalidate the path for update state of paid
      revalidatePath(`/order/${orderId}`);

      return {
        success: true,
        message: "Your order has been paid",
      };
    } catch (error) {
      console.error("approvePayPalOrder error:", error);
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
    if (order.isPaid) throw new Error("Order is already paid");

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
      select: {id: true}
    })
    if(!updatedOrder) throw new Error('Order not found')
  }
