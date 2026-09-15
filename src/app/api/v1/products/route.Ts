import { supabase } from "@/utils/supabase/server";

export async function GET() {
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("SERVICE:", process.env.SUPABASE_SERVICE_ROLE_KEY);
  try {

    const { data: products, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error("An error occurred:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
