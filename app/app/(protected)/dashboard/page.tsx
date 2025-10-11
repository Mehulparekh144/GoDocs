import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  // const documents = await getDocuments();

  return (
    <div className="h-screen w-full p-4">
      <h1 className="text-2xl font-bold">My Documents</h1>
      <Separator className="my-4" />
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <Card key={document.id} className="bg-secondary h-[400px] w-[300px]">
            <CardContent className="ring-ring flex h-full w-full items-center justify-center">
              <h2 className="text-2xl font-bold">{document.title}</h2>
            </CardContent>
          </Card>
        ))}
      </div> */}
      <Button className="absolute right-4 bottom-4 z-10" asChild>
        <Link href={"/dashboard/document/new"}>
          <PlusIcon className="size-4" />
          Create new document
        </Link>
      </Button>
    </div>
  );
}
