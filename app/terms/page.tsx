"use client";

import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>
          <Card>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                This is a placeholder for the Terms of Service. The actual
                terms content will be added here.
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

