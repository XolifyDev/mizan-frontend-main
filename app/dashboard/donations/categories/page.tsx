"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

// Server action to fetch categories
async function getCategories(masjidId: string) {
  try {
    const response = await fetch(`/api/donation-categories?masjidId=${masjidId}`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Server action to update category order
async function updateCategoryOrder(categories: any[], masjidId: string) {
  try {
    const response = await fetch('/api/donation-categories/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories, masjidId }),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  } catch (error) {
    console.error('Error updating category order:', error);
    throw error;
  }
}

// Update SortableRow definition to type children prop
interface SortableRowProps {
  category: any;
  children: (args: { attributes: React.HTMLAttributes<any>; listeners: any }) => React.ReactNode;
  [key: string]: any;
}

function SortableRow({ category, children, ...props }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'bg-[#FDF0D5] opacity-80 rounded' : ''}
      {...props}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

export default function DonationsCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const masjidId = useSearchParams().get("masjidId") || "";

  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to manage donation categories.
        </p>
      </div>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (masjidId) {
      fetchCategories();
    }
  }, [masjidId]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories(masjidId);
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    router.push(`/dashboard/donations/categories/create?masjidId=${masjidId}`);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);
      
      const newCategories = [...categories];
      const [movedItem] = newCategories.splice(oldIndex, 1);
      newCategories.splice(newIndex, 0, movedItem);
      
      setCategories(newCategories);
      setOrderChanged(true);
    }
  };

  const handleSaveOrder = async () => {
    try {
      await updateCategoryOrder(categories, masjidId);
      setOrderChanged(false);
      toast({
        title: "Success",
        description: "Category order updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await fetch('/api/donation-categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast({ title: 'Deleted', description: 'Category deleted successfully' });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Donation Categories
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Organize giving options.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Reorder categories, update amounts, and tailor kiosk experiences.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            {orderChanged && (
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                onClick={handleSaveOrder}
              >
                Save Order
              </Button>
            )}
          </div>
        </div>
      </div>
      <Tabs defaultValue="categories" className="w-full">
        <TabsContent value="categories">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Donation Categories</CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">Manage donation categories displayed on kiosks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 animate-bounce rounded" />
                  ))}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((cat) => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-4">
                      {categories.map((category) => (
                        <SortableRow key={category.id} category={category}>
                          {({ attributes, listeners }: { attributes: React.HTMLAttributes<any>; listeners: any }) => (
                            <Card className="w-full relative flex flex-col p-4 border border-[#550C18]/10 shadow-sm">
                              <div className="flex items-start gap-4">
                                {/* Drag handle and logo/icon */}
                                <div className="flex flex-row items-center justify-center mr-2 min-w-[40px] h-full gap-2">
                                  <div className="flex items-center justify-center cursor-grab select-none" {...attributes} {...listeners}>
                                    <GripVertical className="h-5 w-5 text-[#550C18]" />
                                  </div>
                                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gray-50 border">
                                    {category.logo ? (
                                      <img src={category.logo} alt="Logo" className="h-14 w-14 rounded-full object-cover" />
                                    ) : (
                                      <span style={{ color: category.color, fontSize: 28 }}>{category.icon}</span>
                                    )}
                                  </div>
                                </div>
                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-bold text-lg truncate">{category.name}</span>
                                        {category.featured && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Featured</Badge>}
                                      </div>
                                      <div className="text-sm text-gray-600 truncate">{category.description}</div>
                                    </div>
                                    {/* Actions menu */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Open menu</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/donations/categories/edit/${category.id}?masjidId=${masjidId}`)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit Category
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          {category.active ? (
                                            <>
                                              <XCircle className="mr-2 h-4 w-4" />
                                              Deactivate
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle2 className="mr-2 h-4 w-4" />
                                              Activate
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => { setCategoryToDelete(category); setDeleteDialogOpen(true); }}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {(() => {
                                      const da = category.defaultAmounts;
                                      if (!da) return null;
                                      if (Array.isArray(da)) {
                                        return da.map((amount: any, i: number) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="border-[#550C18]/20 text-[#550C18]"
                                          >
                                            ${amount}
                                          </Badge>
                                        ));
                                      } else if (typeof da === "string" && da.includes(",")) {
                                        return da.split(",").map((amount: string, i: number) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="border-[#550C18]/20 text-[#550C18]"
                                          >
                                            ${amount.trim()}
                                          </Badge>
                                        ));
                                      } else {
                                        return (
                                          <Badge
                                            variant="outline"
                                            className="border-[#550C18]/20 text-[#550C18]"
                                          >
                                            ${da}
                                          </Badge>
                                        );
                                      }
                                    })()}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>Min: ${category.min}</span>
                                    <span>Max: ${category.max}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                                    {category.recurring && <Badge className="bg-green-100 text-green-700 border-green-200">Recurring</Badge>}
                                    {category.restricted && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1"><Lock className="h-3 w-3" />Restricted</Badge>}
                                    {category.active ? (
                                      <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" />Active</Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center"><XCircle className="h-4 w-4 mr-1" />Inactive</Badge>
                                    )}
                                    <span className="text-xs text-gray-500 font-bold ">${category.amountDonated || 0} Donated</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}
                        </SortableRow>
                      ))}
                      {categories.length === 0 && (
                        <div className="text-center text-gray-500 py-8">No categories found</div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete <b>{categoryToDelete?.name}</b>? This action cannot be undone.</div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} type="button">Cancel</Button>
            <Button
              className="bg-red-600 text-white"
              onClick={() => handleDelete(categoryToDelete?.id)}
              type="button"
              disabled={!categoryToDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
