import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  glowColor?: string;
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
  glowColor,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={cn(
        "glass-card rounded-xl p-5 hover:bg-white/[0.06] transition-all duration-300 group cursor-default",
        glowColor
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-white/90 mt-2">{value}</p>
            {change && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-md",
                  changeType === "positive"
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-red-400 bg-red-400/10"
                )}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            iconBg
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
