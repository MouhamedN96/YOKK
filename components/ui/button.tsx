"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({ className, variant = "default", size = "default", ref, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-terracotta-primary text-white hover:bg-terracotta-primary/90",
        variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === "outline" && "border border-white/10 bg-transparent hover:bg-white/5 hover:text-clay-white",
        variant === "secondary" && "bg-white/10 text-clay-white hover:bg-white/20",
        variant === "ghost" && "hover:bg-white/5 hover:text-clay-white",
        variant === "link" && "text-terracotta-primary underline-offset-4 hover:underline",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 rounded-md px-3",
        size === "lg" && "h-11 rounded-md px-8",
        size === "icon" && "h-10 w-10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}
