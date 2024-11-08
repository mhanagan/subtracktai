"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";

export type SortOption = "name" | "price-asc" | "price-desc";

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortControls({ currentSort, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">
            <div className="flex items-center">
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              Name (A-Z)
            </div>
          </SelectItem>
          <SelectItem value="price-desc">
            <div className="flex items-center">
              <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
              Price (High to Low)
            </div>
          </SelectItem>
          <SelectItem value="price-asc">
            <div className="flex items-center">
              <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
              Price (Low to High)
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}