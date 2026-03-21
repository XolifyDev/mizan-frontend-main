"use server";

import { UTApi } from "uploadthing/server";

const uploadFiles = async (fd: FormData) => {
    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });  
    const files = fd.getAll("files") as File[];
    const uploadedFiles = await utapi.uploadFiles(files);
    return uploadedFiles;
}

export { uploadFiles };