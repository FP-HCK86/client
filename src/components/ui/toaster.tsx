"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import checklistImg from '@/assets/checklist.png'
import cancelImg from '@/assets/cancel.png'
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = (props as any).variant
        const hideTitle = variant === "success" || variant === "warning"

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              {/* Icon for success / warning */}
              {variant === "warning" && (
                <img
                  src={cancelImg}
                  alt="Warning"
                  className="mt-1 h-4 w-4 object-contain"
                  aria-hidden
                />
              )}
              {variant === "success" && (
                <img
                  src={checklistImg}
                  alt="Success"
                  className="mt-1 h-4 w-4 object-contain"
                  aria-hidden
                />
              )}

              <div className="grid gap-1">
                {!hideTitle && title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
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