"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getItems } from "@/lib/store"
import { Input } from "@/components/ui/input"

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [categories, setCategories] = React.useState<string[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isCreatingNew, setIsCreatingNew] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // 获取所有已有的分类
  React.useEffect(() => {
    try {
      const items = getItems()
      const uniqueCategories = [...new Set(items.map((item) => item.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
      setCategories([])
    }
  }, [])

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue)
    setOpen(false)
  }

  const handleCreateCategory = () => {
    if (inputValue && inputValue.trim() !== "") {
      const newCategory = inputValue.trim()
      onChange(newCategory)
      if (!categories.includes(newCategory)) {
        setCategories((prev) => [...prev, newCategory])
      }
      setInputValue("")
      setIsCreatingNew(false)
      setOpen(false)
    }
  }

  // 当点击"创建新分类"按钮时
  const handleStartCreatingNew = () => {
    setIsCreatingNew(true)
    // 等待DOM更新后聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || "选择或创建分类"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        {isCreatingNew ? (
          <div className="flex items-center p-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入新分类名称"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateCategory()
                } else if (e.key === "Escape") {
                  setIsCreatingNew(false)
                }
              }}
            />
            <Button size="sm" className="ml-2" onClick={handleCreateCategory} disabled={!inputValue.trim()}>
              创建
            </Button>
            <Button size="sm" variant="outline" className="ml-1" onClick={() => setIsCreatingNew(false)}>
              取消
            </Button>
          </div>
        ) : (
          <Command>
            <div className="flex items-center border-b px-3">
              <CommandInput placeholder="搜索分类..." value={inputValue} onValueChange={setInputValue} />
              <Button variant="ghost" size="sm" className="ml-2 h-8 px-2 text-xs" onClick={handleStartCreatingNew}>
                <Plus className="mr-1 h-3 w-3" />
                新建
              </Button>
            </div>
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  未找到匹配的分类
                  <Button variant="link" className="mt-2 h-auto p-0" onClick={handleStartCreatingNew}>
                    创建新分类
                  </Button>
                </div>
              </CommandEmpty>
              {categories.length > 0 && (
                <CommandGroup heading="已有分类">
                  {categories.map((category) => (
                    <CommandItem key={category} value={category} onSelect={() => handleSelect(category)}>
                      <Check className={cn("mr-2 h-4 w-4", value === category ? "opacity-100" : "opacity-0")} />
                      {category}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
