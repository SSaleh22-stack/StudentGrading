import FileDetailClient from "./FileDetailClient";

// Required for static export - return empty array since file IDs are dynamic (from localStorage)
export function generateStaticParams() {
  return [];
}

export default function FileDetailPage() {
  return <FileDetailClient />;
}
