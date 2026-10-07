import React from 'react';

// Renders a fullscreen muted video background pinned behind all content.
const VideoBackground = ({ src }) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden bg-black"
      style={{ zIndex: 0 }}
    >
      <video
        key={src}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/15" />
    </div>
  );
};

export default VideoBackground;
