"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Copy, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EditIqamahTimingForm } from "./edit-iqamah-timing-form"

type IqamahTimingsTableProps = {
  timings: any[]
  loading: boolean
  onRefresh: () => void
}

export function IqamahTimingsTable({ timings, loading, onRefresh }: IqamahTimingsTableProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [editingTiming, setEditingTiming] = useState<any>(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const { toast } = useToast()

  const sortedTimings = [...timings].sort((a, b) => {
    const dateA = new Date(a.changeDate).getTime()
    const dateB = new Date(b.changeDate).getTime()
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA
  })

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const handleEdit = (timing: any) => {
    setEditingTiming(timing)
    setOpenEditDialog(true)
  }

  const handleDelete = async (id: string) => {
    // Implement delete functionality
    toast({
      title: "Not implemented",
      description: "Delete functionality would be implemented here",
    })
  }

  const handleDuplicate = (timing: any) => {
    // Implement duplicate functionality
    toast({
      title: "Not implemented",
      description: "Duplicate functionality would be implemented here",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#550C18]"></div>
      </div>
    )
  }

  if (timings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#3A3A3A]/70">No Iqamah timings found. Add your first timing.</p>
      </div>
    )
  }

  return (
    <div>
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        {editingTiming && (
          <DialogContent className="sm:max-w-[600px]">
            <EditIqamahTimingForm
              timing={editingTiming}
              onSuccess={() => {
                setOpenEditDialog(false)
                onRefresh()
              }}
            />
          </DialogContent>
        )}
      </Dialog>

      <div className="rounded-md border border-[#550C18]/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#550C18]/5">
            <TableRow>
              <TableHead className="w-[180px] cursor-pointer" onClick={toggleSortOrder}>
                <div className="flex items-center">
                  Iqamah Change Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Fajr</TableHead>
              <TableHead>Dhuhr</TableHead>
              <TableHead>Asr</TableHead>
              <TableHead>Maghrib</TableHead>
              <TableHead>Isha</TableHead>
              <TableHead>Jumuah I</TableHead>
              <TableHead>Jumuah II</TableHead>
              <TableHead>Jumuah III</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTimings.map((timing) => (
              <TableRow key={timing.id}>
                <TableCell className="font-medium">{format(new Date(timing.changeDate), "dd MMM, yyyy")}</TableCell>
                <TableCell>{timing.fajr}</TableCell>
                <TableCell>{timing.dhuhr}</TableCell>
                <TableCell>{timing.asr}</TableCell>
                <TableCell>{timing.maghrib === "0" ? "Sunset" : timing.maghrib}</TableCell>
                <TableCell>{timing.isha}</TableCell>
                <TableCell>{timing.jumuahI || "-"}</TableCell>
                <TableCell>{timing.jumuahII || "-"}</TableCell>
                <TableCell>{timing.jumuahIII || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(timing)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(timing)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(timing.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
