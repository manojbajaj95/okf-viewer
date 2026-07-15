"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createBundleLinkComponent } from "./BundleLink";

const prose = [
  "max-w-prose text-foreground",
  "[&_p]:my-3 [&_p]:leading-7 [&_p]:text-pretty",
  "[&_h1]:mb-3 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight",
  "[&_h2]:mb-2 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:my-1 [&_li]:leading-7",
  "[&_blockquote]:my-4 [&_blockquote]:rounded-md [&_blockquote]:bg-muted/70 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-150 hover:[&_a]:underline motion-reduce:[&_a]:transition-none",
  "[&_img]:my-4 [&_img]:rounded-md",
].join(" ");

export function MarkdownBody({
  body,
  fromRelPath,
}: {
  body: string;
  fromRelPath: string;
}) {
  const BundleLink = createBundleLinkComponent(fromRelPath);

  return (
    <div className={prose}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: BundleLink,
          hr: () => <Separator className="my-8" />,
          table: ({ children }) => <Table>{children}</Table>,
          thead: ({ children }) => <TableHeader>{children}</TableHeader>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => <TableHead>{children}</TableHead>,
          td: ({ children }) => <TableCell>{children}</TableCell>,
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
