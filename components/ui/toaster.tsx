"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="max-w-[90vw] md:max-w-[420px] mb-safe">
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription className="break-words">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className="flex flex-col gap-2 sm:gap-1 p-4 sm:bottom-0 sm:right-0 md:right-4 md:pb-6 md:max-w-[420px] w-full" />
    </ToastProvider>
  )
}
