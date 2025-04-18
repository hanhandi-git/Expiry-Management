"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "@/components/search-bar"
import { SearchResults } from "@/components/search-results"
import { getItems } from "@/lib/store"
import type { Item } from "@/types"
import { useDebounce } from "@/hooks/use-debounce"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"

export function SearchContainer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFields, setSearchFields] = useState<string[]>(["name", "category", "note"])
  const [searchResults, setSearchResults] = useState<Item[]>([])
  const [showResults, setShowResults] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 处理搜索
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setShowResults(!!query.trim())
  }, [])

  // 处理搜索字段变化
  const handleFilterChange = useCallback((fields: string[]) => {
    setSearchFields(fields)
  }, [])

  // 处理点击搜索结果项
  const handleItemClick = useCallback(
    (item: Item) => {
      router.push(`/edit/${item.id}`)
      setShowResults(false)
    },
    [router],
  )

  // 点击外部关闭搜索结果
  useOnClickOutside(containerRef, () => setShowResults(false))

  // 执行搜索
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([])
      return
    }

    const items = getItems()
    const query = debouncedSearchQuery.toLowerCase()

    // 模糊搜索实现
    const results = items.filter((item) => {
      return searchFields.some((field) => {
        if (field === "name" && item.name.toLowerCase().includes(query)) {
          return true
        }
        if (field === "category" && item.category.toLowerCase().includes(query)) {
          return true
        }
        if (field === "note" && item.note?.toLowerCase().includes(query)) {
          return true
        }
        return false
      })
    })

    setSearchResults(results)
  }, [debouncedSearchQuery, searchFields])

  return (
    <div ref={containerRef} className="relative mb-6">
      <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} className="mb-2" />

      {showResults && (
        <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg max-h-[60vh] overflow-y-auto">
          <SearchResults
            items={searchResults}
            searchQuery={debouncedSearchQuery}
            searchFields={searchFields}
            onItemClick={handleItemClick}
          />
        </div>
      )}
    </div>
  )
}
