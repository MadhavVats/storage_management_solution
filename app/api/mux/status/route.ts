import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    const assetId = searchParams.get('assetId');

    if (!uploadId && !assetId) {
      return NextResponse.json(
        { error: 'Either uploadId or assetId is required' },
        { status: 400 }
      );
    }

    let asset;
    let upload;

    if (uploadId) {
      // Get upload status
      upload = await mux.video.uploads.retrieve(uploadId);
      
      if (upload.asset_id) {
        // If upload is complete, get asset details
        asset = await mux.video.assets.retrieve(upload.asset_id);
      }
    } else if (assetId) {
      // Get asset directly
      asset = await mux.video.assets.retrieve(assetId);
    }

    const response: any = {
      upload: upload ? {
        id: upload.id,
        status: upload.status,
        assetId: upload.asset_id,
      } : null,
    };

    if (asset) {
      response.asset = {
        id: asset.id,
        status: asset.status,
        playbackIds: asset.playback_ids,
        duration: asset.duration,
        aspectRatio: asset.aspect_ratio,
        created: asset.created_at,
      };

      // Generate thumbnail URL if asset is ready
      if (asset.status === 'ready' && asset.playback_ids && asset.playback_ids.length > 0) {
        const playbackId = asset.playback_ids[0].id;
        response.asset.thumbnail = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=400&height=225&fit_mode=smartcrop`;
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking Mux asset status:', error);
    return NextResponse.json(
      { error: 'Failed to check asset status' },
      { status: 500 }
    );
  }
}
