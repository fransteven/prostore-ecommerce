import { Metadata } from "next";
import Link from "next/link";
import { getMyOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Pagination from "@/components/shared/pagination";
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
  CheckCircle2,
  Clock,
  Eye,
  Package,
  PackageCheck,
  ShoppingBag,
  XCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and manage your purchase history and order details",
};

async function OrdersPage(props: { searchParams: Promise<{ page: string }> }) {
  const { page = "1" } = await props.searchParams;
  const currentPage = Number(page) || 1;
  const orders = await getMyOrders({ page: currentPage });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <ShoppingBag className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track previous purchases, check delivery status, and view receipts.
          </p>
        </div>
      </div>

      {/* Orders Container */}
      <Card className="overflow-hidden border-border/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/40 bg-muted/20 px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Order History
          </CardTitle>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            Page {currentPage} of {orders.totalPages || 1}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[120px]">ORDER ID</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>PAYMENT</TableHead>
                  <TableHead>DELIVERY</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                          <Package className="size-7 stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-foreground">
                            No orders found
                          </p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            You haven&apos;t placed any orders yet. Once you make a purchase, it will appear here.
                          </p>
                        </div>
                        <Button asChild size="sm" className="mt-2 gap-1.5 shadow-xs">
                          <Link href="/">
                            <span>Start Shopping</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.data.map((order) => {
                    const formattedDate = formatDateTime(order.createdAt);
                    return (
                      <TableRow
                        key={order.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <TableCell>
                          <span className="inline-block rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-mono text-xs font-medium text-foreground">
                            {formatId(order.id)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-foreground">
                            {formattedDate.dateOnly}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formattedDate.timeOnly}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-foreground font-mono">
                          {formatCurrency(order.totalPrice)}
                        </TableCell>
                        <TableCell>
                          {order.isPaid && order.paidAt ? (
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
                        </TableCell>
                        <TableCell>
                          {order.isDelivered && order.deliveredAt ? (
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
                              <span>Processing</span>
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                          >
                            <Link href={`/order/${order.id}`}>
                              <Eye className="size-3.5" />
                              <span>Details</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {orders.totalPages > 1 && (
            <div className="border-t border-border/40 p-4">
              <Pagination
                page={currentPage}
                totalPages={orders.totalPages}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrdersPage;
