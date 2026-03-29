import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  index?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "positive",
  icon: Icon,
  iconBg,
  iconColor,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              {change && (
                <div className="flex items-center gap-1 mt-1">
                  {changeType === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      changeType === "positive" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {change}
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                iconBg
              )}
            >
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
