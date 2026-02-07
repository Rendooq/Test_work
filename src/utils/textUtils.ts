// src/utils/textUtils.ts

export type TransformAction =
  | 'upper'
  | 'lower'
  | 'cap_words'
  | 'cap_first'
  | 'add_plus'
  | 'remove_plus'
  | 'add_quotes'
  | 'remove_quotes'
  | 'add_brackets'
  | 'remove_brackets'
  | 'add_dash'
  | 'remove_dash'
  | 'trim'
  | 'remove_tabs'
  | 'remove_after_dash'
  | 'space_to_underscore'
  | 'strip_special'
  | 'find_replace'
  | 'sort_asc'
  | 'sort_desc'
  | 'unique';

export interface TransformPayload {
  action: TransformAction;
  text: string;
  params?: {
    find?: string;
    replace?: string;
  };
}

export const transformText = (payload: TransformPayload): string => {
  const { action, text, params } = payload;

  // Operations that don't require line splitting (O(1) or O(N) on full string)
  switch (action) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'find_replace':
      if (!params?.find) return text;
      // Global replace
      return text.split(params.find).join(params.replace || '');
    case 'space_to_underscore':
      return text.replace(/ /g, '_');
    case 'remove_tabs':
      return text.replace(/\t/g, '');
    case 'strip_special':
      // Unicode friendly strip: Keep Letters, Numbers, Whitespace, and newlines
      return text.replace(/[^\p{L}\p{N}\s]/gu, '');
  }

  // Line-based operations
  // We split by newline to handle line-specific logic
  let lines = text.split('\n');

  switch (action) {
    // Case
    case 'cap_words':
      lines = lines.map(line => line.replace(/\b\w/g, c => c.toUpperCase()));
      break;
    case 'cap_first':
      lines = lines.map(line => line.charAt(0).toUpperCase() + line.slice(1));
      break;

    // Symbols
    case 'add_plus':
      lines = lines.map(line => (line.trim() ? `+${line}` : line));
      break;
    case 'remove_plus':
      lines = lines.map(line => line.replace(/^\+/, ''));
      break;
    case 'add_quotes':
      lines = lines.map(line => (line.trim() ? `"${line}"` : line));
      break;
    case 'remove_quotes':
      lines = lines.map(line => line.replace(/^"|"$/g, ''));
      break;
    case 'add_brackets':
      lines = lines.map(line => (line.trim() ? `[${line}]` : line));
      break;
    case 'remove_brackets':
      lines = lines.map(line => line.replace(/^\[|\]$/g, ''));
      break;
    case 'add_dash':
      lines = lines.map(line => (line.trim() ? `- ${line}` : line));
      break;
    case 'remove_dash':
      lines = lines.map(line => line.replace(/^- ?/, ''));
      break;

    // Cleaning
    case 'trim':
      lines = lines.map(line => line.trim());
      break;
    case 'remove_after_dash':
      lines = lines.map(line => {
        const idx = line.indexOf(' -');
        return idx !== -1 ? line.substring(0, idx) : line;
      });
      break;

    // Sort / Unique
    case 'sort_asc':
      lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      break;
    case 'sort_desc':
      lines.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      break;
    case 'unique':
      // Set is O(N) for insertion and iteration
      lines = Array.from(new Set(lines));
      break;
  }

  return lines.join('\n');
};
