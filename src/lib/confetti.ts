/**
 * Confetti Engine for DomPlace Marketplace
 *
 * Creates a burst of colorful particles from a specific screen position.
 * Particles are rendered as lightweight div elements using requestAnimationFrame.
 */

// Brand color palette
const CONFETTI_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#84cc16', // lime
];

const PARTICLE_COUNT_MIN = 30;
const PARTICLE_COUNT_MAX = 50;
const ANIMATION_DURATION_MS = 800;
const PARTICLE_SIZE_MIN = 6;
const PARTICLE_SIZE_MAX = 10;
const VELOCITY_MIN = 2;
const VELOCITY_MAX = 7;
const GRAVITY = 0.15;
const FRICTION = 0.98;
const SPREAD_ANGLE = Math.PI * 2; // full circle burst

interface Particle {
  element: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  startTime: number;
}

/**
 * Get or create the confetti container element.
 * The container is a fixed, full-viewport div with pointer-events: none.
 */
function getOrCreateContainer(): HTMLElement {
  let container = document.getElementById('confetti-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'confetti-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Pick a random color from the brand palette.
 */
function randomColor(): string {
  return CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
}

/**
 * Return a random number in [min, max].
 */
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Create a single particle element and its physics state.
 */
function createParticle(originX: number, originY: number, startTime: number): Particle {
  const size = randomRange(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX);
  const color = randomColor();
  const angle = Math.random() * SPREAD_ANGLE;
  const velocity = randomRange(VELOCITY_MIN, VELOCITY_MAX);

  const element = document.createElement('div');
  element.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background-color: ${color};
    border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    will-change: transform, opacity;
  `;

  return {
    element,
    x: originX,
    y: originY,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity - randomRange(1, 3), // slight upward bias
    rotation: Math.random() * 360,
    rotationSpeed: randomRange(-10, 10),
    size,
    color,
    startTime,
  };
}

/**
 * Animate a set of particles using requestAnimationFrame.
 * Each particle fades out over ANIMATION_DURATION_MS, then is removed from the DOM.
 */
function animateParticles(particles: Particle[]): void {
  const startTime = performance.now();

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Apply physics
      p.vy += GRAVITY;
      p.vx *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Calculate opacity: fade from 1 to 0 over duration
      const opacity = 1 - progress;

      // Update DOM element
      p.element.style.transform = `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px) rotate(${p.rotation}deg)`;
      p.element.style.opacity = String(opacity);

      // Remove finished particles
      if (progress >= 1) {
        p.element.remove();
        particles.splice(i, 1);
      }
    }

    // Continue if there are still particles to animate
    if (particles.length > 0) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

/**
 * Fire a confetti burst from the given screen coordinates (x, y).
 *
 * @param x - Horizontal position in CSS pixels from the left of the viewport.
 * @param y - Vertical position in CSS pixels from the top of the viewport.
 */
export function fireConfetti(x: number, y: number): void {
  const container = getOrCreateContainer();
  const particleCount = Math.floor(randomRange(PARTICLE_COUNT_MIN, PARTICLE_COUNT_MAX + 1));
  const now = performance.now();

  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = createParticle(x, y, now);
    container.appendChild(particle.element);
    particles.push(particle);
  }

  animateParticles(particles);
}

/**
 * Fire a confetti burst from the center of the given DOM element.
 * Calculates the element's bounding rect and uses its center point.
 *
 * @param element - The HTML element to use as the burst origin.
 */
export function fireConfettiFromElement(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  fireConfetti(centerX, centerY);
}
