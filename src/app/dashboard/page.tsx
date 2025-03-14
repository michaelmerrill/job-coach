import { stackServerApp } from "@/lib/stack";

export default async function Dashboard() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.primaryEmail}</p>
    </div>
  );
}
