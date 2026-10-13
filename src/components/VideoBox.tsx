import { useState } from 'react';
import ArtBox from './ArtBox';
import type { Accent } from '../lib/types';

type Props = { videoSrc: string; posterSrc: string; accent: Accent; seed: string };

// A 16:9 box that plays the part's intro video when the file exists and otherwise shows the cover.
function VideoBox({ videoSrc, posterSrc, accent, seed }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="video-box" data-accent={accent}>
      <ArtBox src={posterSrc} ratio="16/9" accent={accent} seed={seed} />
      {!failed && (
        <video
          className="video-el"
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default VideoBox;
