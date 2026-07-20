import { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useUploadAvatarMutation, useDeleteAvatarMutation } from '../../hooks/useUser';
import UserAvatar from './UserAvatar';

interface AvatarUploadProps {
  avatarUrl?: string | null;
  fullName: string;
}

/**
 * AvatarUpload provides an interactive image uploader for user profile photos.
 * Implements client-side size limits (2MB), mime-type checking, loading states, and removal triggers.
 */
export default function AvatarUpload({ avatarUrl, fullName }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatarMutation();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatarMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Enforce 2MB size limit in the client to avoid sending large payloads
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Max limit is 2MB.');
      return;
    }

    // Verify correct mime-types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file format. Please select JPEG, PNG, or WEBP.');
      return;
    }

    uploadAvatar(file, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Failed to upload photo.';
        setError(msg);
      },
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      setError(null);
      deleteAvatar(undefined, {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Failed to remove photo.';
          setError(msg);
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="avatar-upload-widget">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <UserAvatar
            avatarUrl={avatarUrl}
            fullName={fullName}
            size="xl"
            className="ring-4 ring-slate-100 object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-900">Profile Photo</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading || isDeleting}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
              Upload new photo
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isUploading || isDeleting}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-red-200 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Allowed formats: JPG, PNG, WEBP. Max size: 2MB.
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
