/**
 * highlightMatch — wraps matched substrings in <mark> elements for search highlighting.
 * Returns an array of objects suitable for rendering inline.
 *
 * @param {string} text  - The source text to search within.
 * @param {string} query - The search query to highlight.
 * @returns {Array<{type: 'text'|'mark', key: number, text: string}>}
 */
export function highlightMatch(text = '', query = '') {
  if (!text) return [];
  if (!query || !query.trim()) {
    return [{ type: 'text', key: 0, text: String(text) }];
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);

  return parts.map((part, i) =>
    regex.test(part)
      ? { type: 'mark', key: i, text: part }
      : { type: 'text', key: i, text: part }
  );
}

/**
 * renderHighlight — renders the output of highlightMatch as React nodes.
 * Must be used inside JSX.
 *
 * @param {string} text  - The source text.
 * @param {string} query - The search query.
 * @returns {React.ReactNode}
 */
export function renderHighlight(text = '', query = '') {
  if (!text) return null;
  if (!query || !query.trim()) return text;

  const parts = highlightMatch(text, query);
  return parts.map((part, i) => {
    if (typeof part === 'string') return <span key={i}>{part}</span>;
    return part.type === 'mark' ? (
      <mark key={part.key ?? i} className="bg-[#FFE082] text-[#8A5700] rounded-xs px-0.5 font-bold">
        {part.text}
      </mark>
    ) : (
      <span key={part.key ?? i}>{part.text}</span>
    );
  });
}
