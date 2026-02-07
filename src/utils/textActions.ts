export const textActions = {
  // Case Operations
  toUpperCase: (text: string) => text.toUpperCase(),
  toLowerCase: (text: string) => text.toLowerCase(),
  capitalizeWords: (text: string) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase()),
  capitalizeFirstLetter: (text: string) =>
    text
      .split('\n')
      .map((line) => line.charAt(0).toUpperCase() + line.slice(1))
      .join('\n'),

  // Symbol Operations
  addPlus: (text: string) =>
    text
      .split('\n')
      .map((line) => (line.trim() ? `+${line}` : line))
      .join('\n'),
  removePlus: (text: string) => text.replace(/^\+/gm, ''),
  
  addQuotes: (text: string) =>
    text
      .split('\n')
      .map((line) => (line.trim() ? `"${line}"` : line))
      .join('\n'),
  removeQuotes: (text: string) => text.replace(/^"|"$/gm, ''),

  addBrackets: (text: string) =>
    text
      .split('\n')
      .map((line) => (line.trim() ? `[${line}]` : line))
      .join('\n'),
  removeBrackets: (text: string) => text.replace(/^\[|\]$/gm, ''),

  addDash: (text: string) =>
    text
      .split('\n')
      .map((line) => (line.trim() ? `-${line}` : line))
      .join('\n'),
  removeDash: (text: string) => text.replace(/^-/gm, ''),

  addDashBrackets: (text: string) =>
    text
      .split('\n')
      .map((line) => (line.trim() ? `-[${line}]` : line))
      .join('\n'),
  removeDashBrackets: (text: string) => text.replace(/^-\[|\]$/gm, ''),
  
  addDashQuotes: (text: string) =>
    text
      .split('\n')
      .map((line) => (line.trim() ? `-"${line}"` : line))
      .join('\n'),
  removeDashQuotes: (text: string) => text.replace(/^-"|"$/gm, ''),

  // Cleaning Operations
  trim: (text: string) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .join('\n'),
  removeTabs: (text: string) => text.replace(/\t/g, ''),
  removeAfterDash: (text: string) =>
    text
      .split('\n')
      .map((line) => {
        const idx = line.indexOf(' -');
        return idx !== -1 ? line.substring(0, idx) : line;
      })
      .join('\n'),
  replaceSpacesWithUnderscore: (text: string) => text.replace(/ /g, '_'),
  // Unicode friendly strip: Keep Letters, Numbers, Whitespace, and newlines
  stripSpecialCharacters: (text: string) => text.replace(/[^\p{L}\p{N}\s]/gu, ''),

  // Search & Replace
  findAndReplace: (text: string, find: string, replace: string) => 
    find ? text.split(find).join(replace) : text,

  // Sorting & Unique
  sortAZ: (text: string) =>
    text
      .split('\n')
      .sort((a, b) => a.localeCompare(b, ['en', 'ru', 'uk']))
      .join('\n'),
  sortZA: (text: string) =>
    text
      .split('\n')
      .sort((a, b) => b.localeCompare(a, ['en', 'ru', 'uk']))
      .join('\n'),
  removeDuplicates: (text: string) =>
    Array.from(new Set(text.split('\n'))).join('\n'),
};
