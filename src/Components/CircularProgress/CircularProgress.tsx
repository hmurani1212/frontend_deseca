import React, { useState, memo } from "react";

interface CircularProgressProps {
  radius?: number;
  stroke?: number;
  progress: number;
  count?: number;
  sColor?: string;
  progressMainColor?: string;
}

const CircularProgress = memo<CircularProgressProps>(({ radius, stroke, progress, count, sColor, progressMainColor }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const containerStyle: React.CSSProperties = {
    height: isHovered ? `7px` : '3px',
    backgroundColor: progressMainColor,
    borderRadius: '3px',
    overflow: 'hidden',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.3s ease-in-out',
  };

  const filledBarStyle: React.CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: sColor,
    transition: 'width 0.3s ease-in-out',
  };

  const countStyle: React.CSSProperties = {
    fontSize: isHovered ? '15px' : '12px',
    color: '#212529',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div className="">
       <div
        style={containerStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        <div style={filledBarStyle}></div>
      </div>
    </div>
  );
});

CircularProgress.displayName = 'CircularProgress';

export default CircularProgress;

