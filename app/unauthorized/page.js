'use client'
import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage({ searchParams }) {
  const router = useRouter()
  const requestedPath = typeof searchParams?.path === 'string' ? searchParams.path : ''

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">403</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">
            You don&apos;t have permission to access {requestedPath ? <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{requestedPath}</span> : 'this page'}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
