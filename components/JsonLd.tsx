/**
 * Renders a JSON-LD structured-data block (`<script type="application/ld+json">`).
 *
 * Server component — render it anywhere in a page's JSX. Pass a single schema
 * object or an array of them. `<` is escaped to `<` so question/solution
 * text containing markup can never break out of the script tag.
 */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
