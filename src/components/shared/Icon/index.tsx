import { GLYPHS, type IconName } from "./glyphs";

export type { IconName };

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"
    >
      {GLYPHS[name].map(([kind, d], i) => (kind === "f" ? <path key={i} d={d} fill="currentColor" stroke="none" /> : <path key={i} d={d} />))}
    </svg>
  );
}
