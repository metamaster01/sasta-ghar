// lib/imagekit/upload.ts
// ============================================================
// IMAGEKIT SETUP — Complete guide + upload utility
// ============================================================
//
// STEP 1: Create ImageKit account
//   → Go to https://imagekit.io and sign up (free tier: 20GB storage, 20GB bandwidth/mo)
//
// STEP 2: Get credentials from ImageKit Dashboard → Developer Options
//   → Public Key:   pk_xxxxx
//   → Private Key:  pk_xxxxx (server-side only)
//   → URL Endpoint: https://ik.imagekit.io/YOUR_IMAGEKIT_ID
//
// STEP 3: Add to .env.local
//   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/YOUR_IMAGEKIT_ID
//   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=pk_xxxxx
//   IMAGEKIT_PRIVATE_KEY=private_xxxxx
//
// STEP 4: Install SDK
//   npm install imagekit-javascript
//
// STEP 5: API route for ImageKit auth token (app/api/imagekit-auth/route.ts)
//   ImageKit requires a server-generated signature for client-side uploads.
//   See: app/api/imagekit-auth/route.ts (already created below)
//
// HOW IMAGES FLOW:
//   Browser → /api/imagekit-auth (gets signature) → ImageKit CDN
//   → ImageKit URL stored in Supabase property_media.url
//   → Images served via ImageKit CDN (auto-optimized, WebP, responsive)
//
// FOLDER STRUCTURE IN IMAGEKIT:
//   /sastaghar/properties/{property_id}/{filename}
//   e.g. /sastaghar/properties/abc123/cover.jpg
//
// IMAGEKIT TRANSFORMATIONS (used in Image components):
//   Thumbnail:  ?tr=w-400,h-300,c-maintain_ratio,q-80
//   Cover:      ?tr=w-1200,h-800,c-maintain_ratio,q-85
//   Gallery:    ?tr=w-800,h-600,c-maintain_ratio,q-85
//   OG Image:   ?tr=w-1200,h-630,c-maintain_ratio,q-85
//
// ============================================================

// ── ImageKit client-side upload ───────────────────────────────
export interface ImageKitUploadResult {
  url:        string;
  fileId:     string;
  name:       string;
  filePath:   string;
  thumbnailUrl: string;
  width:      number;
  height:     number;
  size:       number;
}

export interface UploadProgress {
  file:       File;
  progress:   number;   // 0-100
  status:     "pending" | "uploading" | "done" | "error";
  result?:    ImageKitUploadResult;
  error?:     string;
  localUrl:   string;   // object URL for preview before upload
}

// ── Get ImageKit auth signature from our API ──────────────────
async function getAuthToken(): Promise<{ token: string; expire: number; signature: string }> {
  const res = await fetch("/api/imagekit-auth");
  if (!res.ok) throw new Error("Failed to get ImageKit auth token");
  return res.json();
}

// ── Upload single file to ImageKit ───────────────────────────
export async function uploadToImageKit({
  file,
  folder,
  onProgress,
}: {
  file:       File;
  folder:     string;  // e.g. "properties/abc-123"
  onProgress: (pct: number) => void;
}): Promise<ImageKitUploadResult> {
  const { token, expire, signature } = await getAuthToken();
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

  const formData = new FormData();
  formData.append("file",       file);
  formData.append("fileName",   file.name);
  formData.append("folder",     `/sastaghar/${folder}`);
  formData.append("token",      token);
  formData.append("expire",     String(expire));
  formData.append("signature",  signature);
  formData.append("publicKey",  publicKey);
  formData.append("useUniqueFileName", "true");
  formData.append("tags",       "sastaghar,property");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url:          data.url,
          fileId:       data.fileId,
          name:         data.name,
          filePath:     data.filePath,
          thumbnailUrl: data.thumbnailUrl,
          width:        data.width,
          height:       data.height,
          size:         data.size,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status} — ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
    xhr.send(formData);
  });
}

// ── Build ImageKit URL with transformations ───────────────────
export function ikUrl(url: string, transform?: string): string {
  if (!url || !transform) return url;
  // If URL is already an ImageKit URL, append transformation
  if (url.includes("ik.imagekit.io")) {
    return `${url}?tr=${transform}`;
  }
  return url;
}

export const IK_TRANSFORMS = {
  thumbnail: "w-400,h-300,c-maintain_ratio,q-80",
  cover:     "w-1200,h-800,c-maintain_ratio,q-85",
  gallery:   "w-800,h-600,c-maintain_ratio,q-85",
  card:      "w-600,h-400,c-maintain_ratio,q-80",
  og:        "w-1200,h-630,c-maintain_ratio,q-85",
};