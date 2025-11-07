import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center gap-6">
            <AlertCircle className="h-20 w-20 text-gray-400" />

            <h1 className="text-3xl font-bold text-white">
              404 — Page not found
            </h1>
            <p className="text-gray-300 max-w-xl">
              We couldn&apos;t find the page you&apos;re looking for. It may
              have been moved, renamed, or never existed.
            </p>

            <div className="flex justify-center items-center">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Go to Homepage
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              If you think this is an error, contact support or try reloading.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
