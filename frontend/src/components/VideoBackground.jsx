import React from 'react';

// Renders a fullscreen muted video background.
const VideoBackground = ({ src }) => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        key={src}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};

export default VideoBackground;
