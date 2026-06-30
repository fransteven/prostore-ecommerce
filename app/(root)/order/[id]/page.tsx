import { getOrderById } from "@/lib/actions/order.actions"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata ={
    title: "Order Details"
}

async function OrderDetailsPage(props: {
    params:Promise<{
        id:string
    }>
}) {
    const {id} = await props.params
    const order = await getOrderById(id)

    if(!order) notFound()

  return (
    <div>
        OrderDetailsPage
        {id }
    </div>
  )
}

export default OrderDetailsPage
