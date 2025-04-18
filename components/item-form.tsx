"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { Item } from "@/types"
import { addItem, getItem, updateItem } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { CategorySelect } from "@/components/category-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(1, { message: "物品名称不能为空" }),
  category: z.string().min(1, { message: "物品类别不能为空" }),
  purchaseDate: z.date({ required_error: "请选择购买日期" }),
  expiryDate: z.date({ required_error: "请选择过期日期" }),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ItemForm({ itemId }: { itemId?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showShelfLifeDialog, setShowShelfLifeDialog] = useState(false)
  const [shelfLifeDays, setShelfLifeDays] = useState<number | null>(null)
  const [lastExpiryChange, setLastExpiryChange] = useState<Date | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      note: "",
    },
  })

  const purchaseDate = form.watch("purchaseDate")
  const expiryDate = form.watch("expiryDate")

  // 监听过期日期变化，自动计算保质期
  useEffect(() => {
    if (purchaseDate && expiryDate) {
      // 检查是否是用户手动更改了过期日期（而不是通过计算按钮）
      const isUserChange = !lastExpiryChange || lastExpiryChange.getTime() !== expiryDate.getTime()

      if (isUserChange) {
        const days = differenceInDays(expiryDate, purchaseDate)
        if (days >= 0) {
          setShelfLifeDays(days)
          setShowShelfLifeDialog(true)
        }
      }
    }
  }, [expiryDate, purchaseDate, lastExpiryChange])

  useEffect(() => {
    if (itemId) {
      setIsEditing(true)
      const item = getItem(itemId)
      if (item) {
        form.reset({
          name: item.name,
          category: item.category,
          purchaseDate: new Date(item.purchaseDate),
          expiryDate: new Date(item.expiryDate),
          note: item.note || "",
        })

        // 初始计算保质期天数
        const purchaseDate = new Date(item.purchaseDate)
        const expiryDate = new Date(item.expiryDate)
        const days = differenceInDays(expiryDate, purchaseDate)
        if (days >= 0) {
          setShelfLifeDays(days)
        }
      }
    }
  }, [itemId, form])

  const onSubmit = (values: FormValues) => {
    const itemData: Item = {
      id: itemId || Date.now().toString(),
      name: values.name,
      category: values.category,
      purchaseDate: values.purchaseDate.toISOString(),
      expiryDate: values.expiryDate.toISOString(),
      note: values.note,
      createdAt: isEditing ? getItem(itemId!)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (isEditing) {
      updateItem(itemData)
      toast({
        title: "更新成功",
        description: "物品信息已成功更新",
      })
    } else {
      addItem(itemData)
      toast({
        title: "添加成功",
        description: "物品已成功添加",
      })
    }

    router.push("/")
  }

  // Calculate expiry date based on purchase date and shelf life (in days)
  const calculateExpiryDate = (purchaseDate: Date, shelfLifeDays: number) => {
    if (!purchaseDate || isNaN(shelfLifeDays) || shelfLifeDays < 0) return

    const expiryDate = new Date(purchaseDate)
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays)

    // 记录这次是通过计算按钮设置的过期日期
    setLastExpiryChange(expiryDate)

    form.setValue("expiryDate", expiryDate)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>物品名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="输入物品名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>物品类别 *</FormLabel>
                  <FormControl>
                    <CategorySelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>选择已有分类或创建新分类</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>购买日期 *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? (
                            format(field.value, "yyyy年MM月dd日", { locale: zhCN })
                          ) : (
                            <span>选择日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          // 如果已有过期日期，重新计算保质期
                          if (date && expiryDate) {
                            const days = differenceInDays(expiryDate, date)
                            if (days >= 0) {
                              setShelfLifeDays(days)
                              setShowShelfLifeDialog(true)
                            }
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        locale={zhCN}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>过期日期 *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? (
                            format(field.value, "yyyy年MM月dd日", { locale: zhCN })
                          ) : (
                            <span>选择日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={zhCN} />
                    </PopoverContent>
                  </Popover>
                  {shelfLifeDays !== null && (
                    <FormDescription className="flex items-center mt-1">
                      <Calculator className="h-3 w-3 mr-1" />
                      保质期: {shelfLifeDays} 天
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>保质期计算</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="保质期天数"
                      min="1"
                      value={shelfLifeDays !== null ? shelfLifeDays : ""}
                      onChange={(e) => {
                        const days = Number.parseInt(e.target.value)
                        setShelfLifeDays(days)
                        if (!isNaN(days) && field.value) {
                          calculateExpiryDate(field.value, days)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const purchaseDate = form.getValues("purchaseDate")
                        const expiryDate = form.getValues("expiryDate")
                        if (purchaseDate && expiryDate) {
                          const days = differenceInDays(expiryDate, purchaseDate)
                          setShelfLifeDays(days)
                          toast({
                            title: "保质期计算结果",
                            description: `该物品的保质期为 ${days} 天`,
                          })
                        }
                      }}
                    >
                      计算天数
                    </Button>
                  </div>
                  <FormDescription>输入保质期天数，自动计算过期日期</FormDescription>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>备注</FormLabel>
                <FormControl>
                  <Textarea placeholder="添加备注信息（可选）" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              取消
            </Button>
            <Button type="submit">{isEditing ? "更新物品" : "添加物品"}</Button>
          </div>
        </form>
      </Form>

      {/* 保质期计算结果对话框 */}
      <Dialog open={showShelfLifeDialog} onOpenChange={setShowShelfLifeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>保质期计算结果</DialogTitle>
            <DialogDescription>根据您选择的日期自动计算</DialogDescription>
          </DialogHeader>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">保质期信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">购买日期</p>
                  <p className="text-lg">
                    {purchaseDate ? format(purchaseDate, "yyyy年MM月dd日", { locale: zhCN }) : "未设置"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">过期日期</p>
                  <p className="text-lg">
                    {expiryDate ? format(expiryDate, "yyyy年MM月dd日", { locale: zhCN }) : "未设置"}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">计算结果</p>
                <p className="text-3xl font-bold text-primary mt-1">{shelfLifeDays} 天</p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="mt-4">
            <Button onClick={() => setShowShelfLifeDialog(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
