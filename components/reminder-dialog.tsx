"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Item } from "@/types"
import { getItems } from "@/lib/store"
import { getDaysUntilExpiry, getExpiryStatus } from "@/lib/utils"

export function ReminderDialog() {
  const [open, setOpen] = useState(false)
  const [remindItems, setRemindItems] = useState<Item[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  useEffect(() => {
    // Check for items that need reminders
    const checkExpiringItems = () => {
      const items = getItems()
      const expiringItems = items.filter((item) => {
        const status = getExpiryStatus(item.expiryDate)
        return status === "warning" || status === "expired"
      })

      if (expiringItems.length > 0) {
        setRemindItems(expiringItems)
        setOpen(true)
      }
    }

    // Check on initial load
    checkExpiringItems()

    // Set up interval to check periodically (every hour)
    const interval = setInterval(checkExpiringItems, 3600000)

    return () => clearInterval(interval)
  }, [])

  const handleNext = () => {
    if (currentItemIndex < remindItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      setOpen(false)
      setCurrentItemIndex(0)
    }
  }

  const handleDismissAll = () => {
    setOpen(false)
    setCurrentItemIndex(0)
  }

  if (remindItems.length === 0) return null

  const currentItem = remindItems[currentItemIndex]
  const daysUntil = getDaysUntilExpiry(currentItem.expiryDate)
  const status = getExpiryStatus(currentItem.expiryDate)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={status === "expired" ? "text-red-600" : "text-yellow-600"}>
            {status === "expired" ? "物品已过期提醒" : "物品即将过期提醒"}
          </DialogTitle>
          <DialogDescription>
            {`正在显示第 ${currentItemIndex + 1} 个提醒，共 ${remindItems.length} 个`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{currentItem.name}</h3>
            <p className="text-sm text-gray-500">分类: {currentItem.category}</p>
          </div>

          <div className={status === "expired" ? "text-red-600 font-medium" : "text-yellow-600 font-medium"}>
            {status === "expired"
              ? `已过期 ${Math.abs(daysUntil)} 天`
              : daysUntil === 0
                ? "今天过期"
                : `还有 ${daysUntil} 天过期`}
          </div>

          {currentItem.note && (
            <div className="text-sm">
              <span className="font-medium">备注:</span>
              <p className="text-gray-600">{currentItem.note}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="sm:mr-auto">
            <Link href={`/edit/${currentItem.id}`} onClick={() => setOpen(false)}>
              查看详情
            </Link>
          </Button>
          <Button variant="secondary" onClick={handleDismissAll}>
            全部忽略
          </Button>
          <Button onClick={handleNext}>{currentItemIndex < remindItems.length - 1 ? "下一个" : "关闭"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
