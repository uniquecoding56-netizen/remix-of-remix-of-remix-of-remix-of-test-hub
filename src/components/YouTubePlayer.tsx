import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Youtube, Play, Loader2 } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  thumbnail: string;
  isSaving?: boolean;
}

export function YouTubePlayer({ videoId, title, thumbnail, isSaving }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/50">
      <div className="relative aspect-video bg-black">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault fails
                const target = e.target as HTMLImageElement;
                if (target.src.includes('maxresdefault')) {
                  target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                onClick={() => setIsPlaying(true)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full h-16 w-16 p-0"
              >
                <Play className="h-8 w-8 ml-1" fill="currentColor" />
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm line-clamp-2">{title}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Youtube className="h-3 w-3" />
            YouTube
          </Badge>
          {isSaving && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="default" className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              Playing
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
