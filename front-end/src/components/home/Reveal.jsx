import useInView from '../../hooks/useInView'

/**
 * Wraps any content and fades/slides it up into place the first time it
 * scrolls into view. `delay` (ms) lets siblings stagger for a polished
 * cascading reveal instead of popping in all at once.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', scale = false, children }) {
  const [ref, isVisible] = useInView()

  return (
    <Tag
      ref={ref}
      className={`${scale ? 'reveal-scale' : 'reveal'} ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}
