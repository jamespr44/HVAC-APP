import { useEffect, useState } from 'react';

export default function DitherBackground() {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    let animationFrameId: number;
    let currentX = mousePos.x;
    let currentY = mousePos.y;
    let targetX = mousePos.x;
    let targetY = mousePos.y;

    const handleMouseMove = (ev: MouseEvent) => {
      targetX = ev.clientX;
      targetY = ev.clientY;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.1; // Smooth easing
      currentY += (targetY - currentY) * 0.1;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    loop();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      {/* Interactive gradient blob tracking the mouse */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(25,37,170,0.5) 0%, rgba(200,200,255,0) 70%)',
          transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`,
        }}
      />
      
      {/* Abstract shape to add depth */}
      <div 
        className="absolute right-[-10%] top-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(44,82,130,0.6) 0%, rgba(25,37,170,0) 70%)' }}
      />
      <div 
        className="absolute left-[-5%] bottom-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(25,37,170,0.4) 0%, rgba(44,82,130,0) 70%)' }}
      />

      {/* SVG Noise / Dither overlay */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.4]"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'color-burn',
        }}
      />
    </div>
  );
}
