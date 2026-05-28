export declare function isCloudinaryConfigured(): boolean;
export declare function extractPublicIdFromUrl(secureUrl: string): string | null;
export declare function uploadProfileImage(buffer: Buffer, userId: string): Promise<{
    url: string;
    publicId: string;
}>;
export declare function deleteProfileImage(imageUrl?: string): Promise<void>;
//# sourceMappingURL=cloudinaryService.d.ts.map