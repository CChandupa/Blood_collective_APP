import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize, Platform, PixelRatio } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveValues {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Scale a pixel value proportionally based on screen width (base: 375px) */
  wp: (size: number) => number;
  /** Scale a pixel value proportionally based on screen height (base: 812px) */
  hp: (size: number) => number;
  /** Scale font size — uses moderate scaling so text stays readable */
  fs: (size: number) => number;
  /** Returns the appropriate value based on the current breakpoint */
  responsive: <T>(mobile: T, tablet: T, desktop: T) => T;
}

const BASE_WIDTH = 375;  // iPhone X width as base
const BASE_HEIGHT = 812; // iPhone X height as base

function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useResponsive(): ResponsiveValues {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const handler = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };
    const subscription = Dimensions.addEventListener('change', handler);
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const breakpoint = getBreakpoint(width);

  // Width-percentage based scaling
  const wp = (size: number): number => {
    const scale = width / BASE_WIDTH;
    const newSize = size * scale;
    // Clamp to prevent absurdly large values on desktop
    return Math.min(Math.round(PixelRatio.roundToNearestPixel(newSize)), size * 2.5);
  };

  // Height-percentage based scaling
  const hp = (size: number): number => {
    const scale = height / BASE_HEIGHT;
    const newSize = size * scale;
    return Math.min(Math.round(PixelRatio.roundToNearestPixel(newSize)), size * 2.5);
  };

  // Font scaling — moderate scale factor so text doesn't get too big
  const fs = (size: number): number => {
    const scale = width / BASE_WIDTH;
    const newSize = size + (size * (scale - 1)) * 0.5; // 50% of the scaling factor
    const clamped = Math.max(size * 0.85, Math.min(newSize, size * 1.6));
    return Math.round(PixelRatio.roundToNearestPixel(clamped));
  };

  // Breakpoint-based value selector
  const responsive = <T,>(mobile: T, tablet: T, desktop: T): T => {
    if (breakpoint === 'desktop') return desktop;
    if (breakpoint === 'tablet') return tablet;
    return mobile;
  };

  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    wp,
    hp,
    fs,
    responsive,
  };
}
