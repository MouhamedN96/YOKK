"use client"

import { cn } from "@/lib/utils"

// Minimal category type for chips display
interface CategoryChip {
  id: string
  name: string
  color: string
}

interface CategoryChipsProps {
  categories: CategoryChip[]
  selected?: string | null
  onSelect?: (categoryId: string | null) => void
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect?.(null)}
        className={cn(
          "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
          selected === null
            ? "bg-primary text-primary-foreground yokk-glow-sm"
            : "bg-secondary text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect?.(category.id)}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            selected === category.id ? "text-white" : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
          style={
            selected === category.id
              ? { backgroundColor: category.color, boxShadow: `0 0 12px ${category.color}40` }
              : undefined
          }
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
