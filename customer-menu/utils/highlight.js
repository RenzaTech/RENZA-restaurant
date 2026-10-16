/**
 * highlightMatch — wraps matched substrings in <mark> elements for search highlighting.
 * Returns an array of strings/React elements suitable for rendering inline.
 *
 * @param {string} text  - The source text to search within.
 * @param {string} query - The search query to highlight.
 * @returns {Array}      - Array of strings and <mark> JSX elements.
 */
export function highlightMatch(text = '', query = '') {
  if (!query || !query.trim() || !text) return [text];

  // Escape special regex characters in the query
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

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
 * Usage:
 *   {renderHighlight(item.name, searchQuery)}
 *
 * @param {string} text  - The source text.
 * @param {string} query - The search query.
 * @returns {React.ReactNode[]}
 */
export function renderHighlight(text = '', query = '') {
  const parts = highlightMatch(text, query);
  return parts.map(({ type, key, text: t }) =>
    type === 'mark' ? (
      <mark key={key} className="search-highlight">
        {t}
      </mark>
    ) : (
      <span key={key}>{t}</span>
    )
  );
}
