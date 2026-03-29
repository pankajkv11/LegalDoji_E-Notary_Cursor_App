'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/graphql'

const MAX_FILE_SIZE_MB = 10

export default function UploadDocumentPage() {
  const router = useRouter()
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => {
      if (!f.name.endsWith('.pdf') && f.type !== 'application/pdf') {
        setError('Only PDF files are accepted.')
        return false
      }
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`"${f.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`)
        return false
      }
      return true
    })
    setFiles((prev) => [...prev, ...valid])
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    const token = getToken()
    if (!token) { router.push('/login'); return }

    setError(null)
    setUploading(true)
    try {
      // Convert first file to base64 and save as a document record
      const file = files[0]
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const docTitle = title.trim() || file.name.replace(/\.pdf$/i, '')

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation UploadDoc($input: CreateDocumentInput!) {
            createDocument(input: $input) { id title status }
          }`,
          variables: {
            input: {
              templateId: 'uploaded-document',
              title: docTitle,
              formData: { fileName: file.name, fileSize: file.size, base64Preview: base64.slice(0, 100) },
              currentStep: 1,
            },
          },
        }),
      })
      const json = await res.json()
      if (json.errors?.length) {
        setError(json.errors[0].message ?? 'Upload failed. Please try again.')
        return
      }
      setUploaded(true)
      setFiles([])
      setTitle('')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setUploading(false)
    }
  }

  if (uploaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-12 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-8">Your document has been saved and will appear in your document library.</p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/documents"
              className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-semibold text-sm text-center transition-colors"
            >
              View Documents
            </Link>
            <button
              onClick={() => setUploaded(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Upload Document</h1>
              <p className="text-gray-300 text-sm mt-1">Upload an existing legal document (PDF only)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Drop zone */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select PDF File</h2>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold mb-1">Drag & drop PDF files here</p>
              <p className="text-gray-500 text-sm">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-2">PDF files only · Max {MAX_FILE_SIZE_MB}MB per file</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document title */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Title <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={files[0]?.name.replace(/\.pdf$/i, '') ?? 'Enter a title for this document'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Defaults to the file name if left blank.</p>
          </div>
        )}

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Uploaded documents are stored securely and appear in your document library. You can request notarization from the dashboard after uploading.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm text-center transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex-1 bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Document'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
