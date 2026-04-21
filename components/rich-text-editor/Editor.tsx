"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { ReactNode } from "react";
import { editorExtensions } from "./extensions";
import MenuBar from "./MenuBar";

type RichTextEditorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  sendButton: ReactNode;
  footerLeft?: ReactNode;
};

const RichTextEditor = ({
  field,
  sendButton,
  footerLeft,
}: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    content: (() => {
      if (!field?.value) return "";

      try {
        return JSON.parse(field.value);
      } catch {
        return "";
      }
    })(),
    onUpdate: ({ editor }) => {
      if (field?.onChange) {
        const json = editor.getJSON();
        field.onChange(JSON.stringify(json));
      }
    },
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[125] focus:outline-none p-4 prose dark:prose-invert marker:text-white",
      },
    },
  });

  return (
    <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="max-h-[200] overflow-y-auto" />

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-input bg-card">
        <div className="min-h-8 flex items-center">{footerLeft}</div>
        <div className="shrink-0">{sendButton}</div>
      </div>
    </div>
  );
};

export default RichTextEditor;
