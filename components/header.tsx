"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Home } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeSelector } from "@/components/theme-selector"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="flex justify-between items-center mb-8">
      <Link href="/" className="text-2xl font-bold">
        物品过期提醒
      </Link>
      <div className="flex gap-2 items-center">
        <ThemeToggle />
        <ThemeSelector />
        {pathname !== "/" && (
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Link>
          </Button>
        )}
        {pathname !== "/add" && (
          <Button asChild>
            <Link href="/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              添加物品
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
