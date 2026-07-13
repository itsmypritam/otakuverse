import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#cc785c] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#efe9de] text-[#141413]",
        coral: "bg-[#cc785c] text-white",
        outline: "text-[#6c6a64] border border-[#e6dfd8]",
        dark: "bg-[#252320] text-[#faf9f5]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
