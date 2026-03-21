import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { uploadFiles } from "@/lib/actions/uploadthing";
import { NextRequest, NextResponse } from "next/server";

// Export routes for Next App Router
export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const results = await uploadFiles(formData);
  return NextResponse.json(results);
};