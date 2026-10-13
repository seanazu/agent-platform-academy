import type { Video } from '../lib/types';

const videoId = (url: string): string | undefined => {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || undefined;
    return u.searchParams.get('v') ?? undefined;
  } catch {
    return undefined;
  }
};

function VideoCard({ video }: { video: Video }) {
  const id = videoId(video.url);
  return (
    <a className="video-card" href={video.url} target="_blank" rel="noopener noreferrer">
      <span className="video-thumb">
        {id && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />}
        <span className="video-play" aria-hidden="true">▶</span>
      </span>
      <span className="video-meta">
        <span className="video-title">{video.title}</span>
        <span className="video-sub">{video.channel} · {video.minutes} min</span>
        <span className="video-why">{video.why}</span>
      </span>
    </a>
  );
}

export default VideoCard;
