"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddSubscriptionButtonProps {
  onClick: () => void;
}

export function AddSubscriptionButton({ onClick }: AddSubscriptionButtonProps) {
  return (
    <Card
      className="flex h-full min-h-[200px] cursor-pointer items-center justify-center border-2 border-dashed transition-colors hover:border-primary hover:bg-muted"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">Add Subscription</span>
      </div>
    </Card>
  );
}