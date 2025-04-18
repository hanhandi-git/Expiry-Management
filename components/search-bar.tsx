"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange: (fields: string[]) => void
  className?: string
}

export function SearchBar({ onSearch, onFilterChange, className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [searchFields, setSearchFields] = useState<string[]>(["name", "category", "note"])
  const inputRef = useRef<HTMLInputElement>(null)

  // 当搜索词变化时触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300) // 300ms 防抖

    return () => clearTimeout(timer)
  }, [query, onSearch])

  // 当搜索字段变化时触发过滤器变化
  useEffect(() => {
    onFilterChange(searchFields)
  }, [searchFields, onFilterChange])

  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  const toggleSearchField = (field: string) => {
    setSearchFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索物品名称、分类或备注..."
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="ml-2 flex-shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>搜索范围</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={searchFields.includes("name")}
            onCheckedChange={() => toggleSearchField("name")}
          >
            物品名称
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.includes("category")}
            onCheckedChange={() => toggleSearchField("category")}
          >
            物品分类
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.includes("note")}
            onCheckedChange={() => toggleSearchField("note")}
          >
            备注信息
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
