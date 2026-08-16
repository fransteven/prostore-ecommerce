import { getOrderById } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddressType } from "@/types";
import { auth } from "@/auth";
import { formatId } from "@/lib/utils";

export async function generateMetadata(props: {
  params: Promise<{
    id: string;
  }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  return {
    title: `Order ${formatId(id)}`,
    description: `Details and fulfillment status for Order ${formatId(id)}`,
  };
}

async function OrderDetailsPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const session = await auth();

  // Ensure only the order creator or an administrator can view the order details
  if (order.userId !== session?.user?.id && session?.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="wrapper py-8 max-w-6xl mx-auto">
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddressType,
        }}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        isAdmin={session?.user?.role === "admin" || false}
      />
    </div>
  );
}

export default OrderDetailsPage;
