import { ModeToggle } from "@/components/toggle-theme";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="border">
      hi
      <ModeToggle />
      <Link href="/get-started">Get Started</Link>
    </div>
  );
}
