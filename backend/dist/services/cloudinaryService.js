"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryConfigured = isCloudinaryConfigured;
exports.extractPublicIdFromUrl = extractPublicIdFromUrl;
exports.uploadProfileImage = uploadProfileImage;
exports.deleteProfileImage = deleteProfileImage;
const cloudinary_1 = require("cloudinary");
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
function isCloudinaryConfigured() {
    return Boolean(cloudName && apiKey && apiSecret);
}
function ensureConfigured() {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env');
    }
    cloudinary_1.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
}
function extractPublicIdFromUrl(secureUrl) {
    const marker = '/upload/';
    const idx = secureUrl.indexOf(marker);
    if (idx === -1)
        return null;
    let path = secureUrl.slice(idx + marker.length);
    path = path.replace(/^v\d+\//, '');
    const lastDot = path.lastIndexOf('.');
    const lastSlash = path.lastIndexOf('/');
    if (lastDot > lastSlash) {
        path = path.slice(0, lastDot);
    }
    return path || null;
}
async function uploadProfileImage(buffer, userId) {
    ensureConfigured();
    return new Promise((resolve, reject) => {
        const upload = cloudinary_1.v2.uploader.upload_stream({
            folder: 'assess-ai/avatars',
            public_id: `${userId}_${Date.now()}`,
            resource_type: 'image',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        }, (error, result) => {
            if (error || !result?.secure_url) {
                reject(error || new Error('Cloudinary upload failed'));
                return;
            }
            resolve({
                url: result.secure_url,
                publicId: result.public_id,
            });
        });
        upload.end(buffer);
    });
}
async function deleteProfileImage(imageUrl) {
    if (!imageUrl?.includes('res.cloudinary.com'))
        return;
    ensureConfigured();
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId)
        return;
    try {
        await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: 'image' });
    }
    catch {
        /* ignore cleanup errors */
    }
}
//# sourceMappingURL=cloudinaryService.js.map