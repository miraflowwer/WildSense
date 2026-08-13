import type Lenis from 'lenis'

/**
 * Shared handle to the single Lenis smooth-scroll instance created by
 * LandingView. FeatureCarousel uses it to pause/resume page scrolling while
 * the scroll-locked feature deck is active.
 */
export const lenisHolder: { instance: Lenis | null } = { instance: null }
