import { auth } from "@/auth";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { formatCurrency } from "@/lib/utils";
import { ShippingAddressType } from "@/types";
import {
  CreditCard,
  Edit2,
  ExternalLink,
  MapPin,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PlaceOrderForm from "./place-order-form";

export const metadata: Metadata = {
  title: "Review & Place Order",
  description: "Review your items, shipping address and payment method before completing your purchase",
};

async function PlaceOrderPage() {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("User not found");

  const user = await getUserById(userId);
  if (!cart || cart.items.length === 0) redirect("/cart");
  if (!user.address) redirect("/shipping-address");
  if (!user.paymentMethod) redirect("/payment-method");

  const userAddress = user.address as ShippingAddressType;
  const totalItemsCount = cart.items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="wrapper py-8 max-w-6xl mx-auto space-y-8">
      <CheckoutSteps current={3} />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Review & Place Order
        </h1>
        <p className="text-sm text-muted-foreground">
          Please verify your shipping details and order items before confirming your purchase.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Card */}
          <Card className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Shipping Address
                </CardTitle>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Link href="/shipping-address">
                  <Edit2 className="size-3.5" />
                  <span>Change</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recipient
                </p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <UserIcon className="size-3.5 text-muted-foreground" />
                  {userAddress.fullName}
                </p>
              </div>
              <div className="mt-3 space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Destination
                </p>
                <p className="text-sm text-foreground font-medium">
                  {userAddress.streetAddress}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userAddress.city}, {userAddress.postalCode}, {userAddress.country}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="size-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Payment Method
                </CardTitle>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Link href="/payment-method">
                  <Edit2 className="size-3.5" />
                  <span>Change</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selected Gateway
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {user.paymentMethod === "CashOnDelivery"
                      ? "Cash On Delivery"
                      : user.paymentMethod === "PayPal"
                      ? "PayPal Checkout"
                      : user.paymentMethod}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs font-normal">
                  {user.paymentMethod === "PayPal" ? "Online Gateway" : "Manual Payment"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingBag className="size-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Review Cart Items
                </CardTitle>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Link href="/cart">
                  <Edit2 className="size-3.5" />
                  <span>Edit Cart</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[80px]">ITEM</TableHead>
                      <TableHead>DESCRIPTION</TableHead>
                      <TableHead className="text-center">QUANTITY</TableHead>
                      <TableHead className="text-right">UNIT PRICE</TableHead>
                      <TableHead className="text-right">LINE TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.items.map((item) => {
                      const itemSubtotal = Number(item.price) * item.qty;
                      return (
                        <TableRow
                          key={item.slug}
                          className="transition-colors hover:bg-muted/40"
                        >
                          <TableCell>
                            <Link
                              href={`/product/${item.slug}`}
                              className="group block relative size-14 rounded-lg overflow-hidden border border-border/60 bg-muted/30 transition-transform duration-200 hover:scale-105"
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover object-center"
                              />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/product/${item.slug}`}
                              className="group inline-flex items-center gap-1.5 font-medium text-sm text-foreground hover:text-primary transition-colors"
                            >
                              <span>{item.name}</span>
                              <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-block rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 font-mono text-xs font-semibold">
                              × {item.qty}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground font-mono">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-foreground font-mono">
                            {formatCurrency(itemSubtotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <Card className="overflow-hidden border-border/60 shadow-xs">
              <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ReceiptText className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Order Summary
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Items ({totalItemsCount})</span>
                    <span className="font-mono text-foreground font-medium">
                      {formatCurrency(cart.itemsPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Shipping & Handling</span>
                    <span className="font-mono font-medium">
                      {Number(cart.shippingPrice) === 0 ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400">
                          FREE
                        </Badge>
                      ) : (
                        <span className="text-foreground">{formatCurrency(cart.shippingPrice)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Estimated Tax</span>
                    <span className="font-mono text-foreground font-medium">
                      {formatCurrency(cart.taxPrice)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <div className="flex justify-between items-baseline mb-4">
                    <div>
                      <span className="text-base font-bold text-foreground">Total</span>
                      <span className="text-xs text-muted-foreground block">
                        (Includes all taxes & fees)
                      </span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-primary font-mono">
                      {formatCurrency(cart.totalPrice)}
                    </span>
                  </div>

                  <PlaceOrderForm />

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Safe & Secure 256-bit Encrypted Checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrderPage;
