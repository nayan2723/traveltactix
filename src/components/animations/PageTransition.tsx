import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Stagger children animation wrapper
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export const StaggerContainer = ({ children, className = '' }: StaggerContainerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ staggerChildren: 0.08 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Individual stagger item
export const StaggerItem = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Fade in on scroll
export const FadeInView = ({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale on hover
export const HoverScale = ({ children, className = '', scale = 1.02 }: { children: ReactNode; className?: string; scale?: number }) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Pulse animation
export const PulseAnimation = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
    className={className}
  >
    {children}
  </motion.div>
);
