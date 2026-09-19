import { useCallback, useEffect, useRef, useState } from 'react'
import Wheel from './Wheel.jsx'
import { sections } from './sections.js'

export default function App() {
  const [index, setIndex] = useState(0)
  const acc = useRef(0)
  const lockedUntil = useRef(0)

  const go = useCallback((next) => {
    setIndex((i) => Math.max(0, Math.min(sections.length - 1, typeof next === 'function' ? next(i) : next)))
  }, [])

  useEffect(() => {
    const step = (dir) => {
      const now = performance.now()
      if (now < lockedUntil.current) return
      lockedUntil.current = now + 550
      go((i) => i + dir)
    }

    const onWheel = (e) => {
      e.preventDefault()
      acc.current += e.deltaY
      if (Math.abs(acc.current) > 40) {
        step(Math.sign(acc.current))
        acc.current = 0
      }
    }
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown'].includes(e.key)) step(1)
      if (['ArrowUp', 'PageUp'].includes(e.key)) step(-1)
    }
    let touchY = null
    const onTouchStart = (e) => { touchY = e.touches[0].clientY }
    const onTouchEnd = (e) => {
      if (touchY == null) return
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) > 40) step(Math.sign(dy))
      touchY = null
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [go])

  const section = sections[index]

  return (
    <main className="page" style={{ '--bg': section.bg, '--fg': section.fg }}>
      <Wheel items={sections} index={index} onSelect={go} />
      <section className="content" key={section.id}>
        <h1>{section.title}</h1>
        <p>{section.body}</p>
      </section>
      <footer className="hint">Scroll · ↑ ↓ · click</footer>
    </main>
  )
}
