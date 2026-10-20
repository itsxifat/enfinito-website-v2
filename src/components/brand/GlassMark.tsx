import { MARK_PATH, MARK_VIEWBOX } from "./markShape";

const { width: W, height: H } = MARK_VIEWBOX;
const BLUE = "#1F55DF";

/** The brand mark rendered as a pane of tinted glass, lit from the top left.
 *  Purely decorative. IDs are fixed, so render at most one per page. */
export function GlassMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id="glass-shape" d={MARK_PATH} />
        <clipPath id="glass-clip">
          <use href="#glass-shape" />
        </clipPath>

        {/* Tint: lighter toward the top left, deeper toward the bottom right. */}
        <linearGradient id="glass-body" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset="0" stopColor={BLUE} stopOpacity=".1" />
          <stop offset=".5" stopColor={BLUE} stopOpacity=".17" />
          <stop offset="1" stopColor={BLUE} stopOpacity=".3" />
        </linearGradient>

        {/* A soft diagonal reflection across the pane. */}
        <linearGradient id="glass-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset=".22" stopColor="#fff" stopOpacity="0" />
          <stop offset=".33" stopColor="#fff" stopOpacity=".5" />
          <stop offset=".37" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Silhouette: a hairline that deepens away from the light. */}
        <linearGradient id="glass-edge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset="0" stopColor={BLUE} stopOpacity=".14" />
          <stop offset=".5" stopColor={BLUE} stopOpacity=".3" />
          <stop offset="1" stopColor={BLUE} stopOpacity=".55" />
        </linearGradient>

        {/* Inner highlight just inside the lit edges. */}
        <linearGradient id="glass-rim" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>

        <filter id="glass-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="22" />
        </filter>

        <filter id="glass-thickness" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="16" />
        </filter>

        {/* Bevel: blur the silhouette into a height map and light it, so every
            edge facing the light picks up its own highlight. */}
        <filter id="glass-bevel" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="9"
            specularConstant="1.3"
            specularExponent="16"
            lightingColor="#fff"
            result="highlight"
          >
            <feDistantLight azimuth="225" elevation="38" />
          </feSpecularLighting>
          <feComposite in="highlight" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>

      {/* Cast shadow, then a frosted base so the shadow doesn't muddy the pane. */}
      <use href="#glass-shape" fill={BLUE} opacity=".13" filter="url(#glass-shadow)" transform="translate(18 42)" />
      <use href="#glass-shape" fill="#fff" opacity=".7" />
      <use href="#glass-shape" fill="url(#glass-body)" />

      <g clipPath="url(#glass-clip)">
        {/* Edges read more saturated than the middle, as through thick glass. */}
        <use
          href="#glass-shape"
          fill="none"
          stroke={BLUE}
          strokeOpacity=".22"
          strokeWidth="44"
          filter="url(#glass-thickness)"
        />
        <rect width={W} height={H} fill="url(#glass-sheen)" />
        <use href="#glass-shape" fill="none" stroke="url(#glass-rim)" strokeWidth="7" />
      </g>
      <use href="#glass-shape" fill="#fff" filter="url(#glass-bevel)" />
      <use href="#glass-shape" fill="none" stroke="url(#glass-edge)" strokeWidth="2" />
    </svg>
  );
}
