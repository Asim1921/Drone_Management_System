import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, MotionValue } from 'framer-motion';
import './TiltedCard.css';

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

interface TiltedCardProps {
  imageSrc?: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = false,
  showTooltip = false,
  overlayContent = null,
  displayOverlayContent = false,
  children,
  className = ''
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues) as MotionValue<number>;
  const rotateY = useSpring(useMotionValue(0), springValues) as MotionValue<number>;
  const scale = useSpring(1, springValues) as MotionValue<number>;
  const opacity = useSpring(0) as MotionValue<number>;
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  }) as MotionValue<number>;

  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    // Disabled 3D rotation effect
    // const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    // const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(0);
    rotateY.set(0);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <div
      ref={ref}
      className={`tilted-card-figure ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">This effect is not optimized for mobile. Check on desktop.</div>
      )}

      <motion.div
        className="tilted-card-inner"
        style={{
          width: imageWidth,
          height: imageHeight,
          // Disabled 3D rotation transforms
          // rotateX: rotateX as any,
          // rotateY: rotateY as any,
          scale: scale as any
        }}
      >
        {imageSrc ? (
          <motion.img
            src={imageSrc}
            alt={altText}
            className="tilted-card-img"
            style={{
              width: imageWidth,
              height: imageHeight
            }}
          />
        ) : (
          <div className="tilted-card-content" style={{ width: imageWidth, height: imageHeight }}>
            {children}
          </div>
        )}

        {displayOverlayContent && overlayContent && (
          <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.div
          className="tilted-card-caption"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {captionText}
        </motion.div>
      )}
    </div>
  );
}

