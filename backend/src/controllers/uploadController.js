const path = require('path');
const { uploadDir } = require('../utils/upload');

// Local upload handler (dev fallback)
function localUpload(req, res){
  if(!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const urlPath = `/uploads/${req.file.filename}`;
  res.json({ url: urlPath });
}

// Presign endpoint for S3 (if configured)
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function presign(req, res){
  const { S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env;
  if(!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) return res.status(501).json({ error: 'S3 not configured — use local upload' });

  try{
    const client = new S3Client({ region: S3_REGION, credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY } });
    const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2,8)}`;
    const command = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key });
    const url = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
    res.json({ url, key });
  }catch(err){
    console.error('S3 presign error', err);
    res.status(500).json({ error: 'Failed to create presigned url' });
  }
}

module.exports = { localUpload, presign };
