'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    particlesJS: (id: string, config: any) => void;
  }
}

interface ParticleBackgroundProps {
  className?: string;
}

export default function ParticleBackground({ className = '' }: ParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesLoaded = useRef(false);

  useEffect(() => {
    if (particlesLoaded.current || !containerRef.current) return;

    const loadParticles = async () => {
      // Check if particles.js is already loaded
      if (typeof window.particlesJS === 'function') {
        initializeParticles();
        return;
      }

      // Load particles.js script
      const existingScript = document.querySelector('script[src="/particles.js-master/particles.js"]') || document.querySelector('script[src*="particles.js"]');
      if (existingScript) {
        // Script already exists, wait for it to load
        const checkInterval = setInterval(() => {
          if (typeof window.particlesJS === 'function') {
            clearInterval(checkInterval);
            initializeParticles();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      // Use CDN as fallback, or use the local file if available
      script.src = '/particles.js-master/particles.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initializeParticles, 100);
      };
      script.onerror = () => {
        // Fallback to CDN if local file fails
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
        cdnScript.async = true;
        cdnScript.onload = () => {
          setTimeout(initializeParticles, 100);
        };
        cdnScript.onerror = () => {
          console.error('Failed to load particles.js from both local and CDN sources');
        };
        document.body.appendChild(cdnScript);
      };
      document.body.appendChild(script);
    };

    const initializeParticles = () => {
      if (!containerRef.current || typeof window.particlesJS !== 'function') {
        console.warn('Particles.js not available or container not found');
        return;
      }
      
      // Prevent multiple initializations
      if (particlesLoaded.current) return;
      particlesLoaded.current = true;

      try {
        window.particlesJS('particles-js-container', {
          particles: {
            number: {
              value: 120,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: '#3b82f6',
            },
            shape: {
              type: 'circle',
              stroke: {
                width: 0,
                color: '#000000',
              },
            },
            opacity: {
              value: 0.8,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.3,
                sync: false,
              },
            },
            size: {
              value: 4,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 1,
                sync: false,
              },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#3b82f6',
              opacity: 0.6,
              width: 2,
            },
            move: {
              enable: true,
              speed: 0.6,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'bounce',
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: {
                enable: true,
                mode: 'repulse',
              },
              onclick: {
                enable: true,
                mode: 'push',
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 400,
                line_linked: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
              push: {
                particles_nb: 4,
              },
              remove: {
                particles_nb: 2,
              },
            },
          },
          retina_detect: true,
        });
      } catch (error) {
        console.error('Error initializing particles.js:', error);
        particlesLoaded.current = false;
      }
    };

    loadParticles();

    return () => {
      // Cleanup: particles.js handles its own cleanup
      particlesLoaded.current = false;
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <div id="particles-js-container" className="absolute inset-0 w-full h-full" />
    </div>
  );
}
