import React from 'react';

const SmileRobot: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="100" cy="100" r="90" fill="#f7fff7" />
    <circle cx="100" cy="100" r="85" fill="#4ecdc4" />
    <circle cx="100" cy="100" r="75" fill="#f7fff7" />
    <circle cx="70" cy="80" r="12" fill="#1a535c" />
    <circle cx="130" cy="80" r="12" fill="#1a535c" />
    <circle cx="70" cy="80" r="4" fill="#ffffff" />
    <circle cx="130" cy="80" r="4" fill="#ffffff" />
    <path d="M70 120 Q100 150 130 120" stroke="#1a535c" strokeWidth="8" strokeLinecap="round" />
    <circle cx="100" cy="30" r="10" fill="#1a535c" />
    <rect x="95" y="30" width="10" height="25" fill="#1a535c" />
    <path d="M50 60 C40 70 35 85 35 95" stroke="#1a535c" strokeWidth="8" strokeLinecap="round" />
    <path d="M150 60 C160 70 165 85 165 95" stroke="#1a535c" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export default SmileRobot;
