import React, { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  avatarUrl: string | null;
  fullName: string | null;
  email: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  fullName,
  email,
  uploading,
  onUpload,
  size = 'md',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const getInitial = () => {
    return (fullName || email || 'U').charAt(0).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-11 h-11 rounded-2xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-24 h-24 rounded-3xl',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgeSizes = {
    sm: 'w-6 h-6 -bottom-1 -right-1',
    md: 'w-7 h-7 -bottom-1 -right-1',
    lg: 'w-8 h-8 -bottom-2 -right-2',
  };

  return (
    <div className="relative group">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        disabled={uploading}
        className={`${sizeClasses[size]} overflow-hidden shadow-lg border-2 border-card ring-1 ring-border bg-primary/10 flex items-center justify-center transition-all hover:ring-primary/50 focus:ring-primary/50 focus:outline-none`}
      >
        {uploading ? (
          <Loader2 className={`${iconSizes[size]} text-primary animate-spin`} />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-primary font-bold text-lg">
            {getInitial()}
          </span>
        )}
      </button>

      <button
        onClick={handleClick}
        disabled={uploading}
        className={`absolute ${badgeSizes[size]} bg-primary text-primary-foreground rounded-full border-2 border-card flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-primary/90`}
      >
        <Camera className={iconSizes[size]} />
      </button>

      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card group-hover:opacity-0 transition-opacity"></span>
    </div>
  );
};

export default AvatarUpload;
