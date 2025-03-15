"use server";

import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  if (!user.clientReadOnlyMetadata?.onboarded) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.primaryEmail}</p>
    </div>
  );
}
