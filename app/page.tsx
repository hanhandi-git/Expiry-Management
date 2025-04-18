import { Header } from "@/components/header"
import { ItemList } from "@/components/item-list"
import { ReminderDialog } from "@/components/reminder-dialog"
import { SearchContainer } from "@/components/search-container"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <Header />
      <SearchContainer />
      <ItemList />
      <ReminderDialog />
    </main>
  )
}
