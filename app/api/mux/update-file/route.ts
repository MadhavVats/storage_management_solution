import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { fileId, ...updateData } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Update the file record
    const updatedFile = await convex.mutation(api.files.updateMuxFile, {
      fileId,
      ...updateData,
    });

    return NextResponse.json({ success: true, file: updatedFile });
  } catch (error) {
    console.error('Error updating Mux file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}
