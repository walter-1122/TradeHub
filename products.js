const SUPABASE_URL = "https://cgclqejzzlrxkuksqgav.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_BI34HY1C7-HR9ZzDrXuabQ_QtTRwbBx";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let PRODUCTS = [];

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products loading error:", error);
    return;
  }

  PRODUCTS = data.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    label: product.category,
    moq: product.moq,
    desc: product.description,
    image: product.image_url || "product-placeholder.svg"
  }));

  window.dispatchEvent(new Event("productsLoaded"));
}

loadProducts();
