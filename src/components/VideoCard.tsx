import type { VideoClip } from '../lib/types';

const videoId = (url: string): string | undefined => {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || undefined;
    return u.searchParams.get('v') ?? undefined;
  } catch {
    return undefined;
  }
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function VideoCard({ video }: { video: VideoClip }) {
  const id = videoId(video.url);
  const url = video.start ? `${video.url}${video.url.includes('?') ? '&' : '?'}t=${video.start}` : video.url;
  return (
    <a className="video-card" href={url} target="_blank" rel="noopener noreferrer">
      <span className="video-thumb">
        {id && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />}
        <span className="video-play" aria-hidden="true">▶</span>
      </span>
      <span className="video-meta">
        <span className="video-title">{video.title}</span>
        <span className="video-sub">{video.channel} · {video.start !== undefined && video.end ? `watch ${clock(video.start)}–${clock(video.end)}` : `${video.minutes} min`}</span>
        <span className="video-why">{video.why}</span>
      </span>
    </a>
  );
}

export default VideoCard;
