import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/actions/user';
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = async () => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return { userId: user.id };
};

export const ourFileRouter = {
  flyerUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const masjidId = formData.get('masjidId') as string;

    if (!file || !masjidId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to the masjid
    const masjid = await prisma.masjid.findFirst({
      where: {
        id: masjidId,
        ownerId: user.id,
      },
    });

    if (!masjid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `flyers/${masjidId}/${fileName}`;

    // Upload to R2 using fetch
    const buffer = await file.arrayBuffer();
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('R2 Upload Error:', error);
      throw new Error('Failed to upload to R2');
    }

    const data = await response.json();
    const url = data.result.variants[0]; // This will be the URL of the uploaded image

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading flyer:', error);
    return NextResponse.json({ error: 'Failed to upload flyer' }, { status: 500 });
  }
} 