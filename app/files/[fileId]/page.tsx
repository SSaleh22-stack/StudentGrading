export async function generateStaticParams() {
  // For static export, we must return at least one path.
  // Since file data is client-side (localStorage), we return a placeholder.
  // The actual routing will be handled client-side.
  return [
    { fileId: 'placeholder' }
  ];
}

import FileDetailClient from "./FileDetailClient";

export default function FileDetailPage() {
  return <FileDetailClient />;
}
