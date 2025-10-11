import { Button } from "@/components/ui/button";
import { Editor } from "./editor";
import { Download, Lock, Share } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-screen w-full">
      <section className="flex h-max w-full items-center justify-between border-b px-4 py-2">
        <Input
          className="w-max border-none! bg-transparent! text-2xl font-bold"
          defaultValue={id === "new" ? "Untitled Document" : id}
        />
        <div className="flex items-center gap-2">
          <ButtonGroup>
            <Button size={"sm"} variant={"outline"}>
              <Share /> Share
            </Button>
            <Button size={"sm"} variant={"outline"}>
              <Lock />
              Manage Access
            </Button>
            <Button size={"sm"}>
              <Download />
              Download
            </Button>
          </ButtonGroup>
        </div>
      </section>
      <Editor content={""} />
    </div>
  );
}
