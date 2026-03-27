"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function MeshGradientSVG() {
  const colors = ["#FFB3D9", "#87CEEB", "#4A90E2", "#2C3E50", "#1A1A2E"]
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const deltaX = (mousePosition.x - centerX) * 0.08
    const deltaY = (mousePosition.y - centerY) * 0.08
    const maxOffset = 8

    setEyeOffset({
      x: Math.max(-maxOffset, Math.min(maxOffset, deltaX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, deltaY)),
    })
  }, [mousePosition])

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[300px]"
      animate={{ y: [0, -8, 0], scaleY: [1, 1.08, 1] }}
      transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      style={{ transformOrigin: "top center" }}
    >
      <div className="relative aspect-[231/289] overflow-hidden rounded-[46%_54%_42%_58%/58%_45%_55%_42%] border border-white/20 shadow-[0_20px_80px_rgba(13,148,136,0.25)]">
        <MeshGradient colors={colors} className="h-full w-full" speed={1} />

        <motion.div
          className="animate-blink absolute left-[33%] top-[42%] h-[52px] w-[36px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f172a]/85"
          animate={{ x: eyeOffset.x, y: eyeOffset.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        />
        <motion.div
          className="animate-blink absolute left-[67%] top-[42%] h-[52px] w-[36px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f172a]/85"
          animate={{ x: eyeOffset.x, y: eyeOffset.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        />
      </div>

      <style jsx>{`
        .animate-blink {
          animation: blink 3s infinite ease-in-out;
        }

        @keyframes blink {
          0%,
          90%,
          100% {
            ry: 30;
          }
          95% {
            ry: 3;
          }
        }
      `}</style>
    </motion.div>
  )
}
