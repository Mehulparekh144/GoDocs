import { EditorSection } from "./editor-section";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditorSection id={id} />;
}
