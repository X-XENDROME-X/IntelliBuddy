import React from 'react';

const SmileRobotAvatar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#1a535c" />
    <circle cx="32" cy="32" r="26" fill="#4ecdc4" />
    <circle cx="22" cy="25" r="5" fill="#ffffff" />
    <circle cx="22" cy="25" r="2" fill="#1a535c" />
    <circle cx="42" cy="25" r="5" fill="#ffffff" />
    <circle cx="42" cy="25" r="2" fill="#1a535c" />
    <path d="M24 38 Q32 45 40 38" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default SmileRobotAvatar;
