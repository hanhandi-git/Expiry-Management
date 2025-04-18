"use client"

import { useState, useEffect } from "react"
import type { Item } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDate, getExpiryStatus } from "@/lib/utils"
import { HighlightedText } from "@/components/highlighted-text"

interface SearchResultsProps {
  items: Item[]
  searchQuery: string
  searchFields: string[]
  onItemClick: (item: Item) => void
}

export function SearchResults({ items, searchQuery, searchFields, onItemClick }: SearchResultsProps) {
  const [visibleResults, setVisibleResults] = useState(5)

  // 重置可见结果数量当搜索查询变化时
  useEffect(() => {
    setVisibleResults(5)
  }, [searchQuery])

  if (items.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">没有找到匹配的物品</div>
  }

  const loadMore = () => {
    setVisibleResults((prev) => prev + 5)
  }

  return (
    <div className="space-y-2">
      {items.slice(0, visibleResults).map((item) => {
        const status = getExpiryStatus(item.expiryDate)

        return (
          <Card
            key={item.id}
            className={cn(
              "cursor-pointer hover:bg-accent/50 transition-colors",
              status === "expired" ? "border-red-300" : status === "warning" ? "border-yellow-300" : "border-gray-200",
            )}
            onClick={() => onItemClick(item)}
          >
            <CardHeader className="p-3 pb-0">
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {searchFields.includes("name") ? (
                    <HighlightedText text={item.name} highlight={searchQuery} />
                  ) : (
                    item.name
                  )}
                </div>
                <Badge variant={status === "expired" ? "destructive" : status === "warning" ? "warning" : "outline"}>
                  {status === "expired" ? "已过期" : status === "warning" ? "即将过期" : "正常"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-2">
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <div>
                    分类:{" "}
                    {searchFields.includes("category") ? (
                      <HighlightedText text={item.category} highlight={searchQuery} />
                    ) : (
                      item.category
                    )}
                  </div>
                  <div>过期日期: {formatDate(item.expiryDate)}</div>
                </div>
                {item.note && (
                  <div className="mt-1 truncate">
                    备注:{" "}
                    {searchFields.includes("note") ? (
                      <HighlightedText text={item.note} highlight={searchQuery} />
                    ) : (
                      item.note
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {items.length > visibleResults && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={loadMore}>
            加载更多结果
          </Button>
        </div>
      )}
    </div>
  )
}

import { cn } from "@/lib/utils"
