import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { filename, fileSize } = await request.json();

    if (!filename || !fileSize) {
      return NextResponse.json(
        { error: 'Filename and file size are required' },
        { status: 400 }
      );
    }

    // Create a direct upload
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policies: ['public'],
        // Removed deprecated mp4_support for basic assets
        normalize_audio: true,
      },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
      assetId: null, // Will be available after upload completes
    });
  } catch (error) {
    console.error('Error creating Mux direct upload:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
