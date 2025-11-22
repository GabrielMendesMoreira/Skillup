import * as React from 'react';

interface VideoPlayerProps {
  videoUrl: string; // Espera a URL completa do vídeo
  lessonTitle: string;
}


export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, lessonTitle }) => {
  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center bg-zinc-900 aspect-video rounded-lg">
        <p className="text-zinc-400">Nenhum vídeo disponível para esta aula.</p>
      </div>
    );
  }

  return(
    <div>
    <iframe
        className='w-full h-full rounded-lg shawdow-xl border-4 border-zinc-700/50'
        src = {videoUrl}
        title={'Player de video - ${lessonTitle}'}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; '
        allowFullScreen
    >
    </iframe>
    </div>

  )

}