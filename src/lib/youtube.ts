export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Regex poderoso que pega:
  // youtube.com/watch?v=ID
  // youtu.be/ID
  // youtube.com/embed/ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  // Retorna a imagem de alta qualidade (hqdefault) ou máxima (maxresdefault)
  // hqdefault é mais garantido de existir em todos os vídeos
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}