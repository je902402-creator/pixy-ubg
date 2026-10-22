import React from 'react';

// Renders a fullscreen muted video background pinned behind all content.
const VideoBackground = ({ src, type = 'video' }) => {
  return (
    <div
      data-testid="media-background"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-black"
      style={{ zIndex: 0 }}
    >
      {type === 'image' ? <img src={src} alt="" className="h-full w-full object-cover" /> : <video
        key={src}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />}
      <div className="absolute inset-0 bg-black/15" />
    </div>
  );
};

export default VideoBackground;
