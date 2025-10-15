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
import { useEffect } from "react";
import { type CreateDocumentRequest } from "@/app/types";

interface EditorProps {
  documentContent: CreateDocumentRequest;
  documentID: string;
  setDocumentContent: (documentContent: CreateDocumentRequest) => void;
  handleAutoSave: (nextContent: CreateDocumentRequest) => void;
}

export const Editor = ({
  documentContent,
  documentID,
  handleAutoSave,
  setDocumentContent,
}: EditorProps) => {
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
          "prose prose-sm sm:prose-base mx-auto focus:outline-none prose-p:my-2 prose-headings:my-4 w-full max-w-[794px] aspect-[794/1123] p-4 sm:p-6 md:p-8 lg:p-[2cm] bg-secondary/50 rounded-lg border",
      },
    },
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const nextContent = {
        ...documentContent,
        content: editor.getHTML(),
      };
      setDocumentContent(nextContent);
      handleAutoSave(nextContent);
    },
  });

  useEffect(() => {
    if (editor && documentID !== "new") {
      editor.commands.setContent(documentContent.content, {
        parseOptions: {
          preserveWhitespace: "full",
        },
      });
    }
  }, [editor, documentContent.content, documentID]);

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
      <div className="h-full w-full origin-top scale-[1]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
