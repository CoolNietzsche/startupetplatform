"use client"

import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-4 items-start w-full">
               {props.variant === "destructive" ? (
                 <AlertCircle className="h-6 w-6 shrink-0 text-[#D53E0F] drop-shadow-sm rounded-full bg-white relative top-0.5" />
               ) : props.variant === "success" ? (
                 <CheckCircle2 className="h-6 w-6 shrink-0 text-[#059669] drop-shadow-sm rounded-full bg-white relative top-0.5" />
               ) : (
                  <Info className="h-6 w-6 shrink-0 text-brand-mint-teal drop-shadow-sm rounded-full bg-white relative top-0.5" />
               )}
               <div className="grid gap-1 flex-1 mt-1">
                 {title && <ToastTitle className="text-[15px]">{title}</ToastTitle>}
                 {description && (
                   <ToastDescription className="text-[13px] leading-relaxed opacity-90 font-medium">{description}</ToastDescription>
                 )}
               </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
