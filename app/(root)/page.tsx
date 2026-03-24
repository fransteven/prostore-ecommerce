import ProductList from "@/components/product/product-list";
import { getProducts } from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";

async function Home() {
  const products = await getProducts();
  return (
    <>
      <ProductList
        data={products}
        title="Newest Arrivals"
        limit={LATEST_PRODUCTS_LIMIT}
      />
    </>
  );
}

export default Home;
