"use client"

// This is a simplified version of the hook that's already in the project
// I'm including it here for completeness, but it should already exist
import { useState, useCallback } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, action, ...props }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, action, ...props }
    setToasts((prevToasts) => [...prevToasts, newToast])
    return id
  }, [])

  const dismiss = useCallback((toastId) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
  }, [])

  return { toast, dismiss, toasts }
}
