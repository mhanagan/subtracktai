"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTheme } from 'next-themes';

interface AddSubscriptionButtonProps {
  onClick: () => void;
}

export function AddSubscriptionButton({ onClick }: AddSubscriptionButtonProps) {
  const { theme } = useTheme();

  return (
    <Card
      className={`flex h-full min-h-[200px] cursor-pointer items-center justify-center 
        border-2 border-dashed 
        ${theme === 'dark' ? 'border-white/70' : 'border-black/70'}
        bg-primary/5 
        transition-all duration-200
        hover:bg-primary/10 hover:scale-[1.02]
        hover:shadow-lg
        ${theme === 'dark' ? 'hover:border-white' : 'hover:border-black'}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3 text-primary">
        <Plus className="h-10 w-10" />
        <span className="text-base font-semibold">Add Subscription</span>
      </div>
    </Card>
  );
}