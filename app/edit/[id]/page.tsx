import { Header } from "@/components/header"
import { ItemForm } from "@/components/item-form"

export default function EditItemPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <Header />
      <h1 className="text-2xl font-bold mb-6">编辑物品</h1>
      <ItemForm itemId={params.id} />
    </main>
  )
}
