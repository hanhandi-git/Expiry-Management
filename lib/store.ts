"use client"

import type { Item } from "@/types"

const STORAGE_KEY = "expiry-reminder-items"

// Get all items from localStorage
export const getItems = (): Item[] => {
  if (typeof window === "undefined") return []

  const items = localStorage.getItem(STORAGE_KEY)
  return items ? JSON.parse(items) : []
}

// Get a single item by ID
export const getItem = (id: string): Item | undefined => {
  const items = getItems()
  return items.find((item) => item.id === id)
}

// Add a new item
export const addItem = (item: Item): void => {
  const items = getItems()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...items, item]))
}

// Update an existing item
export const updateItem = (updatedItem: Item): void => {
  const items = getItems()
  const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems))
}

// Remove an item
export const removeItem = (id: string): void => {
  const items = getItems()
  const filteredItems = items.filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems))
}

// Search items by query
export const searchItems = (query: string, fields: string[] = ["name", "category", "note"]): Item[] => {
  if (!query.trim()) return []

  const items = getItems()
  const normalizedQuery = query.toLowerCase()

  return items.filter((item) => {
    return fields.some((field) => {
      switch (field) {
        case "name":
          return item.name.toLowerCase().includes(normalizedQuery)
        case "category":
          return item.category.toLowerCase().includes(normalizedQuery)
        case "note":
          return item.note?.toLowerCase().includes(normalizedQuery)
        default:
          return false
      }
    })
  })
}
