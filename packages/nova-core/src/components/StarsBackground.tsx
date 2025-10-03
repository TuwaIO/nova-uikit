import { useEffect, useMemo, useState } from 'react';

export function StarsBackground({ starsCount }: { starsCount?: number }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const stars = useMemo(() => {
    if (!isMounted) {
      return [];
    }

    const numStars = starsCount ?? 200;
    return Array.from({ length: numStars }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1 + 0.5,
      isSupernova: Math.random() < 0.1,
      delay: Math.random() * 10,
      duration: 5 + Math.random() * 5,
    }));
  }, [isMounted]);

  return (
    <div className="absolute inset-0 z-1 h-full w-full overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            {`
              /* Pulse animation now includes scale for a more organic feel. */
              @keyframes pulse {
                0%, 100% { 
                  opacity: 0.2;
                  transform: scale(0.9);
                }
                50% {
                  opacity: 0.8;
                  transform: scale(1.2);
                }
              }
              
              /* Supernova animation remains impactful. */
              @keyframes supernova {
                0% { 
                  transform: scale(1);
                  stroke: rgba(var(--tuwa-bg-primary), 0.5);
                  opacity: 0.8;
                }
                20% { 
                  transform: scale(3);
                  stroke: var(--tuwa-button-gradient-from);
                  opacity: 1;
                }
                100% { 
                  transform: scale(0.8);
                  stroke: var(--tuwa-button-gradient-to);
                  opacity: 0;
                }
              }

              .pulsar {
                animation-name: pulse;
                animation-timing-function: ease-in-out;
                animation-iteration-count: infinite;
                transform-origin: center;
              }

              .supernova {
                animation-name: supernova;
                animation-timing-function: ease-out;
                animation-iteration-count: infinite;
                transform-origin: center;
                stroke-width: 2;
              }
            `}
          </style>
        </defs>

        {stars.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={`rgba(var(--tuwa-bg-primary), 0.7)`}
            className={star.isSupernova ? 'supernova' : 'pulsar'}
            style={{
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
