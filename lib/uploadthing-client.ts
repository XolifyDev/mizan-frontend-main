import { createUploadthing } from "uploadthing/next";
import { OurFileRouter } from "./uploadthing";

export const ut = createUploadthing<OurFileRouter>();

export const useUploadThing = ut.useUploadThing; 