import { useEffect, useRef, useState } from 'react'

const STEP = 0.19 // radians between neighbouring options
const VISIBLE = 4 // options shown on each side of the active one

export default function Wheel({ items, index, onSelect }) {
  const [progress, setProgress] = useState(index)
  const [radius, setRadius] = useState(() => window.innerHeight * 0.95)
  const current = useRef(index)
  const target = useRef(index)
  const raf = useRef(0)

  useEffect(() => {
    const onResize = () => setRadius(window.innerHeight * 0.95)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Ease the wheel toward the selected index.
  useEffect(() => {
    target.current = index
    cancelAnimationFrame(raf.current)
    const tick = () => {
      const diff = target.current - current.current
      if (Math.abs(diff) < 0.001) {
        current.current = target.current
        setProgress(current.current)
        return
      }
      current.current += diff * 0.12
      setProgress(current.current)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [index])

  return (
    <nav className="wheel" aria-label="Sections">
      {items.map((item, i) => {
        const d = i - progress
        const abs = Math.abs(d)
        if (abs > VISIBLE + 0.5) return null
        const angle = d * STEP
        const x = radius * Math.cos(angle) - radius
        const y = radius * Math.sin(angle)
        const active = abs < 0.5
        return (
          <button
            key={item.id}
            className={'wheel-item' + (active ? ' active' : '')}
            style={{
              transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle * 0.7}rad)`,
              opacity: Math.max(0, 1 - abs * 0.24),
              filter: `blur(${Math.min(abs, 4) * 1.6}px)`,
            }}
            onClick={() => onSelect(i)}
            aria-current={i === index ? 'true' : undefined}
          >
            <span className="wheel-arrow" style={{ opacity: Math.max(0, 1 - abs * 2) }}>→</span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
