import { getProductById, updateProduct } from "@/app/actions/products";
import { ProductForm } from "../../_components/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produkt bearbeiten – Admin" };

interface Props {
  params: { id: string };
}

export default async function AdminEditProduktPage({ params }: Props) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  // Bind the product id to the action
  const action = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Produkt bearbeiten</h2>
        <p className="text-sm text-slate-500 mt-1 truncate max-w-lg">{product.name}</p>
      </div>

      <ProductForm product={product} action={action} />
    </div>
  );
}
