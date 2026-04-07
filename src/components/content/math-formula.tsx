import katex from "katex";
import { memo, useEffect } from "react";

let cssLoaded = false;

export type MathFormulaMode = "inline" | "block";

interface MathFormulaProps {
  latex: string;
  mode?: MathFormulaMode;
}

export const MathFormula = memo(function MathFormula({
  latex,
  mode = "inline",
}: MathFormulaProps) {
  useEffect(() => {
    if (cssLoaded) return;
    cssLoaded = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/katex.min.css";
    document.head.appendChild(link);
  }, []);

  if (!latex.trim()) return null;

  const displayMode = mode === "block";

  try {
    const html = katex.renderToString(latex, {
      throwOnError: true,
      displayMode,
    });
    const inner = <span dangerouslySetInnerHTML={{ __html: html }} />;

    if (displayMode) {
      return (
        <div
          className="tiptap-mathematics-render katex-display"
          data-type="block-math"
        >
          {inner}
        </div>
      );
    }

    return (
      <span className="tiptap-mathematics-render" data-type="inline-math">
        {inner}
      </span>
    );
  } catch {
    return <span className="text-destructive">{latex}</span>;
  }
});
