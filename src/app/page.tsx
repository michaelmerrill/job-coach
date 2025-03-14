import { Button } from "@/components/ui/button";
import { stackServerApp } from "@/lib/stack";
import Link from "next/link";

export default async function Home() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return (
      <Button asChild>
        <Link href="/handler/signin">Login</Link>
      </Button>
    );
  }

  return (
    <div>
      <h1>Hello, {user?.primaryEmail}</h1>
      <Button asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    </div>
  );
}
