import { redirect } from "next/navigation";

export default function Home() {
  // Root always redirects — middleware handles auth check
  redirect("/dashboard");
}
