import { isImageUrl } from "@/lib/imageUrl";
import { headings } from "@/lib/postMeta";

// Minimal post renderer shared by the public blog and the admin preview, so both always look the same.
// "![alt](url)" on its own line is an image, "## " starts a heading, "### " a smaller one, "- " lines make a list,
// anything else is a paragraph. React escapes the text, so no HTML can be injected.
export default function PostBody({ text }: { text: string }) {
  const ids = headings(text); // anchor ids shared with the table of contents
  let h = 0;
  return (
    <>
      {text.split(/\n{2,}/).map((block, i) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith("### ")) return <h3 key={i} className="blog-h3">{b.slice(4)}</h3>;
        if (b.startsWith("## ")) return <h2 key={i} id={ids[h++]?.id} className="case-h">{b.slice(3)}</h2>;
        const img = b.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (img && isImageUrl(img[2])) {
          return (
            <figure key={i} className="blog-fig">
              <div className="blog-fig-scroll"><img src={img[2]} alt={img[1]} loading="lazy" decoding="async" /></div>
              {img[1] && <figcaption>{img[1]}</figcaption>}
            </figure>
          );
        }
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return <ul key={i} className="blog-ul">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        }
        return <p key={i} className="case-desc">{b}</p>;
      })}
    </>
  );
}
