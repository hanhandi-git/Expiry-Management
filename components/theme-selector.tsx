"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const themes = [
  { name: "默认", value: "default" },
  { name: "蓝色", value: "blue" },
  { name: "绿色", value: "green" },
  { name: "紫色", value: "purple" },
]

export function ThemeSelector() {
  const { theme: currentTheme } = useTheme()
  const [colorTheme, setColorTheme] = useState<string>("default")
  const [mounted, setMounted] = useState(false)

  // 只在客户端挂载后执行一次
  useEffect(() => {
    setMounted(true)
    try {
      // 从 localStorage 获取保存的颜色主题
      const savedColorTheme = localStorage.getItem("color-theme") || "default"
      setColorTheme(savedColorTheme)

      // 应用颜色主题
      document.documentElement.classList.remove("theme-blue", "theme-green", "theme-purple")
      if (savedColorTheme !== "default") {
        document.documentElement.classList.add(`theme-${savedColorTheme}`)
      }
    } catch (error) {
      console.error("Error setting theme:", error)
    }
  }, []) // 空依赖数组确保只执行一次

  // 如果组件未挂载，返回一个占位按钮，避免布局偏移
  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">加载中</span>
      </Button>
    )
  }

  const handleThemeChange = (theme: string) => {
    try {
      // 移除所有主题类
      document.documentElement.classList.remove("theme-blue", "theme-green", "theme-purple")

      // 如果不是默认主题，添加对应的主题类
      if (theme !== "default") {
        document.documentElement.classList.add(`theme-${theme}`)
      }

      // 保存主题设置到 localStorage
      localStorage.setItem("color-theme", theme)
      setColorTheme(theme)
    } catch (error) {
      console.error("Error changing theme:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">选择颜色主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={colorTheme === theme.value ? "bg-accent" : ""}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  theme.value === "default"
                    ? "bg-primary"
                    : theme.value === "blue"
                      ? "bg-blue-500"
                      : theme.value === "green"
                        ? "bg-green-500"
                        : "bg-purple-500"
                }`}
              />
              <span>{theme.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
