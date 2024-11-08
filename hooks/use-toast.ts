"use client";

import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastImpl,
} from "@/components/ui/use-toast";

export function useToast() {
  const { toast, ...rest } = useToastImpl();

  return {
    toast: (props: Omit<ToastProps, "id">) => {
      toast(props);
    },
    ...rest,
  };
}