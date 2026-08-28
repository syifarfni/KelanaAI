import ReactMarkdown from "react-markdown";

interface ItineraryMarkdownProps {
  content: string;
}

export default function ItineraryMarkdown({ content }: ItineraryMarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1
            className="text-lg font-bold text-[#2e3a20] mt-6 mb-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className="text-base font-bold text-[#2e3a20] mt-5 mb-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className="text-base font-bold text-[#2e3a20] mt-5 mb-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-[#5a6e42] mt-3 mb-1">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="text-sm text-[#3a4430] leading-relaxed mb-2">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-sm text-[#3a4430] space-y-1 mb-3 ml-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-sm text-[#3a4430] space-y-1 mb-3 ml-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[#2e3a20]">{children}</strong>
        ),
        hr: () => <hr className="border-[#e0ddd0] my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
