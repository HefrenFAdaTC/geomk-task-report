import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const StatsCard = ({ title, value, icon: Icon, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    default: "bg-card text-foreground",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
