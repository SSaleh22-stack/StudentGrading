import FileDetailClient from "./FileDetailClient";

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Since file data is stored client-side (localStorage) or fetched from API,
  // we cannot determine file IDs at build time.
  // Return empty array to allow dynamic routing at runtime.
  return [];
}

export default function FileDetailPage() {
  return <FileDetailClient />;
}
