import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();
  
    const handleLogout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth');
      router.refresh();
    }

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            Logout
        </button>
    );
}