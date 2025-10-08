import { Editor } from "./editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-screen w-full">
      DocumentPage {id}
      <Editor content={""} />
    </div>
  );
}
