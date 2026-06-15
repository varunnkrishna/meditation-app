'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Box breathing: inhale 4s → hold 4s → exhale 4s → hold 4s (16s total)
const BREATH_CYCLE_S = 16;
const INHALE_END = 0.25;
const HOLD_IN_END = 0.5;
const EXHALE_END = 0.75;

const circleStyle = {
  width: 120,
  height: 120,
  backgroundColor: 'rgba(91, 155, 143, 0.15)',
  border: '1px solid rgba(91, 155, 143, 0.3)',
} as const;

export function BreathingCircle() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: 300, height: 300 }}
        aria-hidden="true"
      >
        <div className="rounded-full" style={circleStyle} />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 300, height: 300 }}
      aria-hidden="true"
    >
      <motion.div
        className="rounded-full"
        style={circleStyle}
        animate={{ scale: [1, 1.5, 1.5, 1, 1] }}
        transition={{
          duration: BREATH_CYCLE_S,
          times: [0, INHALE_END, HOLD_IN_END, EXHALE_END, 1],
          ease: ['easeInOut', 'linear', 'easeInOut', 'linear'],
          repeat: Infinity,
        }}
      />
    </div>
  );
}