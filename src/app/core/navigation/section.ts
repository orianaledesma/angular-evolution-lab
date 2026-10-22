/** First path segment of a URL, ignoring query and fragment: `/v21/bay-a?x=1` → `v21`. */
export function sectionOf(url: string): string {
  return url.split(/[?#]/)[0]?.split('/')[1] ?? '';
}
