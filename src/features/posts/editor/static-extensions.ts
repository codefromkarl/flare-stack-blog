import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import { BlockQuoteExtension } from "@/features/posts/editor/extensions/typography/block-quote";
import { HeadingExtension } from "@/features/posts/editor/extensions/typography/heading";
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
} from "@/features/posts/editor/extensions/typography/list";

export const staticExtensions = [
  StarterKit.configure({
    orderedList: false,
    bulletList: false,
    listItem: false,
    heading: false,
    codeBlock: false,
    blockquote: false,
    code: {
      HTMLAttributes: {
        class:
          "font-mono text-sm px-1 text-foreground/80 bg-muted/40 rounded-sm",
        spellCheck: false,
      },
    },
    underline: {
      HTMLAttributes: {
        class: "underline underline-offset-4 decoration-border/60",
      },
    },
    strike: {
      HTMLAttributes: {
        class: "line-through opacity-50 decoration-foreground/40",
      },
    },
    link: {
      autolink: true,
      openOnClick: false,
      HTMLAttributes: {
        class:
          "font-normal underline underline-offset-4 decoration-border hover:decoration-foreground transition-all duration-300 cursor-pointer text-foreground",
        target: "_blank",
      },
    },
  }),
  BulletListExtension,
  OrderedListExtension,
  ListItemExtension,
  HeadingExtension.configure({
    levels: [1, 2, 3, 4],
  }),
  BlockQuoteExtension,
  CodeBlock.configure({
    languageClassPrefix: "language-",
    exitOnTripleEnter: true,
    exitOnArrowDown: true,
    defaultLanguage: null,
  }),
  Mathematics.configure({
    katexOptions: { throwOnError: false },
  }),
  Table.configure({
    resizable: false,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Image,
];
