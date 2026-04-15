import { ProductForm } from "../_components/ProductForm";
import { createProduct } from "@/app/actions/products";

export const metadata = { title: "Neues Produkt – Admin" };

export default function AdminNeuesProduktPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Neues Produkt</h2>
        <p className="text-sm text-slate-500 mt-1">Füge ein neues Produkt zum Katalog hinzu.</p>
      </div>

      <ProductForm action={createProduct} />
    </div>
  );
}
