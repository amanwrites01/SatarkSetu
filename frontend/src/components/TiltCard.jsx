import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/** Glass card that tilts toward the pointer and tracks a spotlight. */
export default function TiltCard({ children, className = '', style, ...rest }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
    e.currentTarget.style.setProperty('--sx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--sy', `${e.clientY - rect.top}px`);
  };
  const onLeave = () => { x.set(0.5); y.set(0.5); };

  return (
    <motion.div
      className={`tilt glass ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 900, ...style }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
