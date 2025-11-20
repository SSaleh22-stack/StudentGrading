import FileDetailClient from "./FileDetailClient";

// Required for static export with dynamic routes
export async function generateStaticParams(): Promise<{ fileId: string }[]> {
  // Since file data is stored client-side (localStorage) or fetched from API,
  // we cannot determine file IDs at build time.
  // Return empty array - Next.js will handle this route dynamically at runtime.
  // The actual file routing will be handled client-side.
  return [];
}

export default function FileDetailPage() {
  return <FileDetailClient />;
}
