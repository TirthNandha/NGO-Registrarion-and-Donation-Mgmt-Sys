import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data } = await supabase.from("profiles").select("*");

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
