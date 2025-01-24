export function removeHtmlTags(description: string): string {
    return description.replace(/<[^>]*>/g, '');
  }