"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  Table,
  UnderlineIcon,
} from "lucide-react";

export const Editor = ({ content }: { content: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-inside",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write something...",
        showOnlyWhenEditable: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-full px-4 py-3 prose-p:my-2 prose-headings:my-4",
      },
    },
    content: content || "",
    immediatelyRender: false,
  });

  return (
    <div className="h-full w-full px-4">
      <div className="flex h-max w-full items-center gap-2 py-2">
        <ButtonGroup>
          <Button variant={"outline"} size={"icon"}>
            <BoldIcon />
            <span className="sr-only">Bold</span>
          </Button>
          <Button variant={"outline"} size={"icon"}>
            <ItalicIcon />
            <span className="sr-only">Italic</span>
          </Button>
          <Button variant={"outline"} size={"icon"}>
            <UnderlineIcon />
            <span className="sr-only">Underline</span>
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant={"outline"} size={"icon"}>
            <ListIcon />
            <span className="sr-only">List</span>
          </Button>
          <Button variant={"outline"} size={"icon"}>
            <Table />
            <span className="sr-only">Table</span>
          </Button>
        </ButtonGroup>
      </div>
      <div className="bg-secondary/50 h-full w-full rounded-lg border p-4">
        <EditorContent editor={editor} style={{ minHeight: "400px" }} />
      </div>
    </div>
  );
};
