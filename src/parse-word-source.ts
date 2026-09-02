export function parseWordSource(content: string): string[] {
  return content.startsWith('[')
    ? (JSON.parse(content) as string[])
    : content.split(/\r?\n/);
}
