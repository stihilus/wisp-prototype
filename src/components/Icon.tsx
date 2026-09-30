import styles from './Icon.module.css'

type IconProps = {
  svg: string
  size?: number
  width?: number
  height?: number
  className?: string
}

/**
 * Icons are inlined (not <img>) so their `stroke="currentColor"` paths
 * pick up `color` from CSS — needed for hover/active states and theming.
 * The inner SVG is force-fit to the requested box (see Icon.module.css)
 * since the exported SVGs carry whatever size they were exported at in
 * Figma, not necessarily the size we want to render them at here.
 */
export function Icon({ svg, size = 16, width, height, className }: IconProps) {
  return (
    <span
      className={className ? `${styles.icon} ${className}` : styles.icon}
      style={{ width: width ?? size, height: height ?? size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
