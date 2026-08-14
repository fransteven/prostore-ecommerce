"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/95 p-3 shadow-lg backdrop-blur-md">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-bold text-foreground">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

function Charts({
  data: { salesData },
}: {
  data: { salesData: { month: string; totalSales: number }[] };
}) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={salesData}
        margin={{ top: 12, right: 12, left: 12, bottom: 4 }}
      >
        <defs>
          <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity={0.95}
              className="text-primary"
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity={0.45}
              className="text-primary"
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          className="stroke-border/40"
        />

        <XAxis
          dataKey="month"
          stroke="currentColor"
          className="text-muted-foreground text-xs"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />

        <YAxis
          stroke="currentColor"
          className="text-muted-foreground text-xs"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value: number) =>
            value >= 1000
              ? `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
              : `$${value}`
          }
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }}
        />

        <Bar
          dataKey="totalSales"
          fill="url(#salesBarGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
          className="transition-all duration-300 hover:opacity-90"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Charts;
