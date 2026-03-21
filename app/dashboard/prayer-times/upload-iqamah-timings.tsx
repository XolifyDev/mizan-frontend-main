"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, FileDown } from "lucide-react"

interface UploadIqamahTimingsProps {
  masjidId: string
  onSuccess: () => void
  onCancel: () => void
}

export function UploadIqamahTimings({ masjidId, onSuccess, onCancel }: UploadIqamahTimingsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleDownloadTemplate = () => {
    // Create CSV template content
    const headers = "Date,Fajr,Dhuhr,Asr,Maghrib,Isha,Jumuah I,Jumuah II,Jumuah III"
    const sampleRow1 = "04/01/2025,06:30 AM,02:00 PM,06:45 PM,0,09:50 PM,02:10 PM,03:00 PM,"
    const sampleRow2 = "04/15/2025,06:15 AM,02:00 PM,06:30 PM,0,09:30 PM,02:10 PM,03:00 PM,"

    const csvContent = [headers, sampleRow1, sampleRow2].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "iqamah-timings-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      })
      return
    }

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("masjidId", masjidId)

      // Replace with your actual API endpoint
      const response = await fetch("/api/iqamah-timings/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Upload successful",
          description: `${result.count || "Multiple"} Iqamah timings have been uploaded successfully.`,
        })
        onSuccess()
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload Iqamah timings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-[#550C18] mb-6">Upload Iqamah Timings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6">
          <div className="mb-4">
            <FileDown size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Download Sample Template</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Use the template to enter your own timings. The CSV file needs to be in this specific format
          </p>
          <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
            DOWNLOAD
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6">
          <div className="mb-4">
            <Upload size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload Timings</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Upload iqamah timings in CSV format. Please make sure the file is in the correct format
          </p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <Button onClick={handleSelectFile} variant="outline" className="w-full mb-2">
            SELECT CSV FILE
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            File Name: {selectedFile ? selectedFile.name : "No File Selected"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          className="bg-[#550C18] hover:bg-[#78001A] text-white"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
