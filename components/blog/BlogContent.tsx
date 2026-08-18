"use client";

import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeSanitize from "rehype-sanitize";

export default function BlogContent({ content }: { content: string }) {
  if (!content) {
    return <p className="text-gray-400 italic">Article content coming soon.</p>;
  }

  return (
    <div className="blog-content max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold mt-10 mb-4 scroll-mt-24">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-24">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-gray-900 text-base sm:text-lg font-bold mt-8 mb-3 scroll-mt-24">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-600 text-[15px] sm:text-base leading-[1.8] mb-5">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="text-gray-800 font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="text-gray-700 italic">{children}</em>,

          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <Link
                href={href ?? "#"}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-[#1B4FD8] font-medium underline decoration-[#1B4FD8]/30 underline-offset-4 hover:decoration-[#1B4FD8] transition-colors"
              >
                {children}
              </Link>
            );
          },

          ul: ({ children }) => (
            <ul className="space-y-2.5 mb-6 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2.5 mb-6 pl-1 list-decimal marker:text-[#1B4FD8] marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            // @ts-expect-error - checked prop exists for GFM task list items
            const isTaskItem = typeof props.checked === "boolean";
            if (isTaskItem) {
              return (
                <li className="flex items-start gap-2.5 text-gray-600 text-[15px] leading-relaxed list-none -ml-1">
                  {children}
                </li>
              );
            }
            return (
              <li className="flex items-start gap-2.5 text-gray-600 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#1B4FD8] flex-shrink-0" />
                <span className="flex-1">{children}</span>
              </li>
            );
          },

          blockquote: ({ children }) => (
            <blockquote className="my-6 pl-5 pr-4 py-4 rounded-xl bg-[#F5F7FF] border-l-4 border-[#1B4FD8] text-gray-700 text-sm sm:text-[15px] leading-relaxed [&>p]:mb-0 [&>p]:text-gray-700">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-10 border-gray-100" />,

          img: ({ src, alt }) => {
            if (!src) return null;
            return (
              <span className="block my-8">
                <span className="relative block w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={src}
                    alt={alt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-cover"
                  />
                </span>
                {alt && (
                  <span className="block text-center text-gray-400 text-xs mt-2 italic">
                    {alt}
                  </span>
                )}
              </span>
            );
          },

          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="text-left font-semibold text-gray-700 px-4 py-3 border-b border-gray-200 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border-b border-gray-100 text-gray-600 align-top">
              {children}
            </td>
          ),

          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className="block bg-gray-900 text-gray-100 rounded-xl p-4 my-6 text-xs sm:text-sm overflow-x-auto font-mono leading-relaxed"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-[#EEF2FF] text-[#1B4FD8] px-1.5 py-0.5 rounded-md text-[13px] font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="not-prose">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}