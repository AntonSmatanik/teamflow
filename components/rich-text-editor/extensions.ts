import CodeBlock from "@tiptap/extension-code-block-lowlight";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions/placeholder";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";

const lowlight = createLowlight();
lowlight.register(all);

export const baseExtensions = [
  StarterKit.configure({ codeBlock: false }),
  TextAlign.configure({ types: ["paragraph", "heading"] }),
  CodeBlock.configure({ lowlight }),
];

export const editorExtensions = [
  ...baseExtensions,
  Placeholder.configure({ placeholder: "Type your message..." }),
];
