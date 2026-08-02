import { useEffect, useRef, useState } from 'react'
import useInView from '../../hooks/useInView'

/**
 * Counts up from 0 to `value` once it enters the viewport.
 * `suffix`/`prefix` let callers render things like "10,000+" or "4.8/5".
 */
export default function Counter({ value, duration = 1600, suffix = '', prefix = '', decimals = 0 }) {
  const [ref, isVisible] = useInView({ threshold: 0.4 })
  const [display, setDisplay] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isVisible || startedRef.current) return
    startedRef.current = true

    let raf
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutExpo for a satisfying deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isVisible, value, duration])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
