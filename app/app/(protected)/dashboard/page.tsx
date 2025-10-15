import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { MyDocuments } from "./my-documents";

export default async function Dashboard() {
  return (
    <div className="min-h-screen w-full p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Button asChild>
          <Link href={"/dashboard/document/new"}>
            <PlusIcon className="size-4" />
            <span className="hidden md:block">Create new document</span>
          </Link>
        </Button>
      </div>
      <Separator className="my-4" />
      <MyDocuments />
    </div>
  );
}
