"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";

export const Editor = ({ content }: { content: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something...",
      }),
    ],
    content: content,
    immediatelyRender: false,
  });

  return (
    <div className="bg-secondary/50 mx-auto h-full w-full max-w-screen-lg rounded-lg border p-4">
      <EditorContent
        editor={editor}
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto h-full focus:outline-none"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
};
