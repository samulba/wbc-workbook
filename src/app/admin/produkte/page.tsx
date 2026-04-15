import { getAllProducts } from "@/app/actions/products";
import { ProductsTable } from "./_components/ProductsTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produkte – Admin" };

export default async function AdminProdukteListPage() {
  const products = await getAllProducts();

  return (
    <div className="max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Produkte</h2>
          <p className="text-sm text-slate-500 mt-1">
            {products.length} Produkte im Katalog
          </p>
        </div>
        <Link
          href="/admin/produkte/neu"
          className="flex items-center gap-2 px-4 py-2 bg-forest text-white text-sm font-medium rounded-lg hover:bg-forest/90 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Neues Produkt
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
