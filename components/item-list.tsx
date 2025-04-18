"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Clock } from "lucide-react"
import type { Item } from "@/types"
import { getItems, removeItem } from "@/lib/store"
import { formatDate, getDaysUntilExpiry, getExpiryStatus } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function ItemList() {
  const [items, setItems] = useState<Item[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("expiry")
  const { toast } = useToast()

  useEffect(() => {
    const loadItems = () => {
      const storedItems = getItems()
      let filteredItems = [...storedItems]

      // Apply filter
      if (filter !== "all") {
        filteredItems = filteredItems.filter((item) => item.category === filter)
      }

      // Apply sorting
      filteredItems.sort((a, b) => {
        if (sortBy === "expiry") {
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        } else if (sortBy === "name") {
          return a.name.localeCompare(b.name)
        } else if (sortBy === "category") {
          return a.category.localeCompare(b.category)
        }
        return 0
      })

      setItems(filteredItems)
    }

    loadItems()
    // Set up an interval to refresh the list every minute to update expiry status
    const interval = setInterval(loadItems, 60000)

    return () => clearInterval(interval)
  }, [filter, sortBy])

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除这个物品吗？")) {
      removeItem(id)
      setItems(items.filter((item) => item.id !== id))
      toast({
        title: "删除成功",
        description: "物品已成功删除",
      })
    }
  }

  const getCategories = () => {
    const allItems = getItems()
    const categories = [...new Set(allItems.map((item) => item.category))]
    return categories
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">分类筛选:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {getCategories().map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">排序方式:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiry">按过期时间</SelectItem>
              <SelectItem value="name">按名称</SelectItem>
              <SelectItem value="category">按分类</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">暂无物品</h3>
          <p className="text-sm text-gray-500 mt-2">点击"添加物品"按钮开始记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const daysUntil = getDaysUntilExpiry(item.expiryDate)
            const status = getExpiryStatus(item.expiryDate)

            return (
              <Card
                key={item.id}
                className={
                  status === "expired"
                    ? "border-red-300 bg-red-50"
                    : status === "warning"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200"
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge
                      variant={status === "expired" ? "destructive" : status === "warning" ? "warning" : "outline"}
                    >
                      {status === "expired" ? "已过期" : status === "warning" ? "即将过期" : "正常"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">分类: {item.category}</div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">购买日期:</span>
                      <div>{formatDate(item.purchaseDate)}</div>
                    </div>
                    <div>
                      <span className="font-medium">过期日期:</span>
                      <div>{formatDate(item.expiryDate)}</div>
                    </div>
                  </div>
                  {item.note && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">备注:</span>
                      <div className="text-gray-600">{item.note}</div>
                    </div>
                  )}
                  <div className="mt-2 text-sm">
                    <span className="font-medium">状态:</span>
                    <div
                      className={
                        status === "expired"
                          ? "text-red-600"
                          : status === "warning"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }
                    >
                      {status === "expired"
                        ? `已过期 ${Math.abs(daysUntil)} 天`
                        : daysUntil === 0
                          ? "今天过期"
                          : `还有 ${daysUntil} 天过期`}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-end gap-2 w-full">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/edit/${item.id}`}>
                        <Edit className="mr-1 h-4 w-4" />
                        编辑
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      删除
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
