'use client';

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPaypalOrder,
  approvePayPalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
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
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  HandCoins,
  HelpCircle,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Printer,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User as UserIcon,
  Wallet,
  XCircle,
} from "lucide-react";

export default function OrderDetailsTable({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    deliveredAt,
    paidAt,
    createdAt,
    user,
  } = order;

  const formattedCreatedAt = formatDateTime(createdAt);
  const formattedPaidAt = paidAt ? formatDateTime(paidAt) : null;
  const formattedDeliveredAt = deliveredAt ? formatDateTime(deliveredAt) : null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // PayPal Loading State
  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    if (isPending) {
      return (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Loading secure PayPal checkout...</span>
        </div>
      );
    }
    if (isRejected) {
      return (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-destructive">
          <AlertCircle className="size-4" />
          <span>Failed to load PayPal. Please refresh the page.</span>
        </div>
      );
    }
    return null;
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPaypalOrder(order.id);
    if (!res.success) {
      toast.error(res.message);
    }
    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  // Button to mark COD order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        type="button"
        variant="default"
        className="w-full gap-2 shadow-xs"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id);
            if (res.success) {
              toast.success(res.message);
            } else {
              toast.error(res.message);
            }
          })
        }
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Banknote className="size-4" />
            <span>Mark As Paid (COD)</span>
          </>
        )}
      </Button>
    );
  };

  // Button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        type="button"
        variant="default"
        className="w-full gap-2 shadow-xs bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            if (res.success) {
              toast.success(res.message);
            } else {
              toast.error(res.message);
            }
          })
        }
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Updating Delivery Status...</span>
          </>
        ) : (
          <>
            <Truck className="size-4" />
            <span>Mark As Delivered</span>
          </>
        )}
      </Button>
    );
  };

  const totalItemsCount = orderitems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar / Navigation / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium hover:bg-muted"
          >
            <Link href={isAdmin ? "/admin/orders" : "/user/orders"}>
              <ArrowLeft className="size-3.5" />
              <span>{isAdmin ? "Admin Orders" : "My Orders"}</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Order Ref:</span>
            <button
              onClick={copyOrderId}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-mono text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Click to copy full Order ID"
            >
              <span>{formatId(id)}</span>
              {copied ? (
                <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="size-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2 text-xs font-medium hover:bg-muted"
          >
            <Printer className="size-3.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>

      {/* Main Order Header Banner */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Order <span className="font-mono text-primary">{formatId(id)}</span>
              </h1>
              {/* Payment Status Pill */}
              {isPaid ? (
                <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>Paid</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                >
                  <XCircle className="size-3.5" />
                  <span>Unpaid</span>
                </Badge>
              )}

              {/* Delivery Status Pill */}
              {isDelivered ? (
                <Badge className="gap-1.5 border-blue-500/30 bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:text-blue-400">
                  <PackageCheck className="size-3.5" />
                  <span>Delivered</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  <Clock className="size-3.5" />
                  <span>In Transit / Processing</span>
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Placed on {formattedCreatedAt.dateTime}</span>
              </div>
              {user?.name && (
                <div className="flex items-center gap-1.5">
                  <UserIcon className="size-3.5" />
                  <span>Customer: <strong className="text-foreground font-medium">{user.name}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center rounded-lg bg-muted/40 p-3 border border-border/40">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Amount
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        {/* Order Lifecycle Progress Tracker */}
        <div className="mt-8 border-t border-border/50 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Order Status Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Step 1: Order Placed */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 transition-all">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                <Check className="size-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  1. Order Placed
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formattedCreatedAt.dateOnly}
                </p>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div
              className={`flex sm:flex-col items-center sm:items-start gap-3 rounded-lg border p-3.5 transition-all ${
                isPaid
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : paymentMethod === "CashOnDelivery"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border/60 bg-muted/20"
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full shadow-xs ${
                  isPaid
                    ? "bg-emerald-600 text-white"
                    : paymentMethod === "CashOnDelivery"
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isPaid ? (
                  <Check className="size-4 stroke-[2.5]" />
                ) : paymentMethod === "CashOnDelivery" ? (
                  <HandCoins className="size-4" />
                ) : (
                  <CreditCard className="size-4" />
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isPaid
                      ? "text-emerald-800 dark:text-emerald-300"
                      : paymentMethod === "CashOnDelivery"
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-foreground"
                  }`}
                >
                  2. {paymentMethod === "CashOnDelivery" ? "Cash On Delivery" : "Payment"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isPaid
                    ? formattedPaidAt?.dateOnly ?? "Paid"
                    : paymentMethod === "CashOnDelivery"
                    ? "Pay upon delivery"
                    : "Awaiting payment"}
                </p>
              </div>
            </div>

            {/* Step 3: Fulfillment */}
            <div
              className={`flex sm:flex-col items-center sm:items-start gap-3 rounded-lg border p-3.5 transition-all ${
                isDelivered
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isPaid
                  ? "border-blue-500/30 bg-blue-500/5 ring-2 ring-blue-500/10"
                  : "border-border/60 bg-muted/20"
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full shadow-xs ${
                  isDelivered
                    ? "bg-emerald-600 text-white"
                    : isPaid
                    ? "bg-blue-600 text-white animate-pulse"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isDelivered ? (
                  <Check className="size-4 stroke-[2.5]" />
                ) : (
                  <Package className="size-4" />
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDelivered
                      ? "text-emerald-800 dark:text-emerald-300"
                      : isPaid
                      ? "text-blue-800 dark:text-blue-300"
                      : "text-foreground"
                  }`}
                >
                  3. Processing
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isDelivered
                    ? "Dispatched & fulfilled"
                    : isPaid
                    ? "Preparing package"
                    : "Pending payment"}
                </p>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div
              className={`flex sm:flex-col items-center sm:items-start gap-3 rounded-lg border p-3.5 transition-all ${
                isDelivered
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border/60 bg-muted/20"
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full shadow-xs ${
                  isDelivered
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isDelivered ? (
                  <PackageCheck className="size-4" />
                ) : (
                  <Truck className="size-4" />
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDelivered
                      ? "text-emerald-800 dark:text-emerald-300"
                      : "text-muted-foreground"
                  }`}
                >
                  4. Delivered
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isDelivered
                    ? formattedDeliveredAt?.dateOnly ?? "Delivered"
                    : "Pending delivery"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Status Alert Message Banner */}
      {isPaid && isDelivered ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Order Fulfilled & Delivered Successfully</p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              This shipment was delivered on {formattedDeliveredAt?.dateTime}. Thank you for shopping with us!
            </p>
          </div>
        </div>
      ) : isPaid && !isDelivered ? (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-900 dark:text-blue-200">
          <Truck className="size-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 animate-pulse" />
          <div className="text-sm">
            <p className="font-semibold">Payment Confirmed — Order in Progress</p>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
              Payment was verified on {formattedPaidAt?.dateTime}. Your items are currently being prepared for dispatch.
            </p>
          </div>
        </div>
      ) : !isPaid && paymentMethod === "CashOnDelivery" ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <HandCoins className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Cash On Delivery Order</p>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Please have the exact amount of{" "}
              <strong className="font-semibold text-foreground">
                {formatCurrency(totalPrice)}
              </strong>{" "}
              ready to hand to the delivery courier upon arrival.
            </p>
          </div>
        </div>
      ) : !isPaid ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200">
          <AlertCircle className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Action Required: Complete Payment</p>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              Your order is on hold pending checkout. Please use the secure PayPal checkout button below to finalize your purchase.
            </p>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Details + Items (Left) vs Summary + Actions (Right) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping & Delivery Card */}
          <Card className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Delivery Details
                </CardTitle>
              </div>
              {isDelivered ? (
                <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  Delivered
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Pending Delivery
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recipient
                  </p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <UserIcon className="size-3.5 text-muted-foreground" />
                    {shippingAddress.fullName}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shipping Destination
                  </p>
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {shippingAddress.streetAddress}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/40">
                {isDelivered ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
                    <CheckCircle2 className="size-3.5" />
                    <span>Delivered at {formattedDeliveredAt?.dateTime}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="size-3.5" />
                    <span>Standard Express Shipping • Estimated dispatch within 24-48 hours</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wallet className="size-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Payment Method
                </CardTitle>
              </div>
              {isPaid ? (
                <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  Paid
                </Badge>
              ) : (
                <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Not Paid
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selected Gateway
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {paymentMethod === "CashOnDelivery"
                        ? "Cash On Delivery"
                        : paymentMethod === "PayPal"
                        ? "PayPal Checkout"
                        : paymentMethod}
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {paymentMethod === "PayPal" ? "Online" : "Manual"}
                    </Badge>
                  </div>
                </div>

                <div className="sm:text-right">
                  {isPaid ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        <span>Payment Completed</span>
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {formattedPaidAt?.dateTime}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <Clock className="size-3.5" />
                        <span>Awaiting Transaction</span>
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {paymentMethod === "CashOnDelivery"
                          ? "Due upon parcel delivery"
                          : "Please proceed with PayPal"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Table Card */}
          <Card className="overflow-hidden border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingBag className="size-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Purchased Items
                </CardTitle>
              </div>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </Badge>
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
                    {orderitems.map((item) => {
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

        {/* Right Column: Order Summary & Checkout Actions */}
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Financial Breakdown Card */}
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
                    <span>Items Subtotal</span>
                    <span className="font-mono text-foreground font-medium">
                      {formatCurrency(itemsPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Shipping & Handling</span>
                    <span className="font-mono font-medium">
                      {Number(shippingPrice) === 0 ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400">
                          FREE
                        </Badge>
                      ) : (
                        <span className="text-foreground">{formatCurrency(shippingPrice)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Estimated Tax</span>
                    <span className="font-mono text-foreground font-medium">
                      {formatCurrency(taxPrice)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-bold text-foreground">Total</span>
                      <span className="text-xs text-muted-foreground block">
                        (Includes all taxes & fees)
                      </span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-primary font-mono">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* PayPal Checkout Area */}
                {!isPaid && paymentMethod === "PayPal" && (
                  <div className="mt-6 pt-4 border-t border-border/60 space-y-3 print:hidden">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Encrypted PayPal Payment</span>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                      <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                        <PrintLoadingState />
                        <PayPalButtons
                          createOrder={handleCreatePayPalOrder}
                          onApprove={handleApprovePayPalOrder}
                        />
                      </PayPalScriptProvider>
                    </div>
                  </div>
                )}

                {/* Admin Management Controls */}
                {isAdmin && (
                  <div className="mt-6 pt-4 border-t border-border/60 space-y-3 print:hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Admin Controls
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        Staff Only
                      </Badge>
                    </div>

                    {!isPaid && paymentMethod === "CashOnDelivery" && (
                      <div className="space-y-1">
                        <MarkAsPaidButton />
                        <p className="text-[11px] text-muted-foreground text-center">
                          Confirm cash has been received from buyer
                        </p>
                      </div>
                    )}

                    {isPaid && !isDelivered && (
                      <div className="space-y-1">
                        <MarkAsDeliveredButton />
                        <p className="text-[11px] text-muted-foreground text-center">
                          Confirm customer received the package
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assistance & Guarantee Card */}
            <Card className="border-border/60 bg-muted/20 shadow-xs print:hidden">
              <CardContent className="p-4 flex items-start gap-3">
                <HelpCircle className="size-5 shrink-0 text-muted-foreground mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-foreground">Need help with your order?</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Have questions regarding shipment tracking, returns or billing? Our 24/7 support team is here to assist.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
