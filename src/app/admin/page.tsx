import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, SiteHeader } from "@/components/site-header";
import { adminCookie, isAdminSession } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isAdminSession(cookieStore.get(adminCookie.name)?.value)) redirect("/admin/login");
  return <><SiteHeader/><AdminDashboard/><Footer/></>;
}
