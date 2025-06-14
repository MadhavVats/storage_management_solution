#!/usr/bin/env node

/**
 * Mux Asset Management Script
 * Lists existing assets and provides option to delete them to free up space
 */

import Mux from '@mux/mux-node';
import * as readline from 'readline';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function listAssets() {
  try {
    console.log('📋 Fetching your Mux assets...\n');
    
    const assets = await mux.video.assets.list({ limit: 20 });
    
    if (assets.data.length === 0) {
      console.log('✅ No assets found in your Mux account.');
      return [];
    }

    console.log(`📊 Found ${assets.data.length} assets:\n`);
    
    assets.data.forEach((asset, index) => {
      console.log(`${index + 1}. Asset ID: ${asset.id}`);
      console.log(`   Status: ${asset.status}`);
      console.log(`   Duration: ${asset.duration ? Math.round(asset.duration) + 's' : 'Unknown'}`);
      console.log(`   Created: ${new Date(asset.created_at).toLocaleDateString()}`);
      
      if (asset.tracks && asset.tracks.length > 0) {
        const videoTrack = asset.tracks.find(t => t.type === 'video');
        if (videoTrack) {
          console.log(`   Resolution: ${videoTrack.max_width}x${videoTrack.max_height}`);
        }
      }
      console.log('');
    });

    return assets.data;
  } catch (error) {
    console.error('❌ Error fetching assets:', error.message);
    return [];
  }
}

async function deleteAsset(assetId) {
  try {
    await mux.video.assets.delete(assetId);
    console.log(`✅ Successfully deleted asset: ${assetId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting asset ${assetId}:`, error.message);
    return false;
  }
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🎬 Mux Asset Management Tool\n');
  
  const assets = await listAssets();
  
  if (assets.length === 0) {
    rl.close();
    return;
  }

  console.log(`📈 You're using ${assets.length}/10 assets on the free plan.\n`);
  
  if (assets.length >= 10) {
    console.log('⚠️  You've reached the free plan limit. You need to delete some assets to upload new videos.\n');
  }

  const action = await askQuestion('What would you like to do?\n1. Delete specific assets\n2. Delete all assets\n3. Exit\n\nEnter your choice (1-3): ');

  switch (action) {
    case '1':
      console.log('\nEnter asset numbers to delete (comma-separated, e.g., 1,3,5):');
      const indices = await askQuestion('Asset numbers: ');
      
      const indexArray = indices.split(',')
        .map(i => parseInt(i.trim()) - 1)
        .filter(i => i >= 0 && i < assets.length);

      if (indexArray.length === 0) {
        console.log('❌ No valid asset numbers provided.');
        break;
      }

      console.log(`\n🗑️  Deleting ${indexArray.length} assets...`);
      
      for (const index of indexArray) {
        const asset = assets[index];
        await deleteAsset(asset.id);
      }
      
      console.log(`\n✅ Deletion complete! You now have ${10 - (assets.length - indexArray.length)} free slots.`);
      break;

    case '2':
      const confirm = await askQuestion('⚠️  Are you sure you want to delete ALL assets? This cannot be undone. (yes/no): ');
      
      if (confirm.toLowerCase() === 'yes') {
        console.log('\n🗑️  Deleting all assets...');
        
        let deletedCount = 0;
        for (const asset of assets) {
          const success = await deleteAsset(asset.id);
          if (success) deletedCount++;
        }
        
        console.log(`\n✅ Deleted ${deletedCount}/${assets.length} assets successfully!`);
        console.log('🎉 You now have 10 free slots for new uploads.');
      } else {
        console.log('❌ Deletion cancelled.');
      }
      break;

    case '3':
      console.log('👋 Goodbye!');
      break;

    default:
      console.log('❌ Invalid choice.');
      break;
  }

  rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  rl.close();
  process.exit(1);
});

main().catch(console.error);
