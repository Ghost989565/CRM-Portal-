"use client"

import { useState } from "react"

type ScriptPanelProps = {
  notes: string | null
  meetingScript?: string
  className?: string
  onHighlightNext?: () => void
  darkMode?: boolean
  fontSize?: number
  onFontSizeChange?: (delta: number) => void
}

export function ScriptPanel({
  notes,
  meetingScript = "",
  className = "",
  darkMode = false,
  fontSize = 16,
  onFontSizeChange,
}: ScriptPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const text = (notes || meetingScript || "").trim() || "No script or speaker notes for this slide."

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] ${className}`}>
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">Script</span>
        <div className="flex items-center gap-1">
          {onFontSizeChange && (
            <>
              <button
                type="button"
                onClick={() => onFontSizeChange(-2)}
                className="rounded px-1.5 py-0.5 text-xs text-white/60 hover:bg-white/8 hover:text-white"
                aria-label="Decrease font"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => onFontSizeChange(2)}
                className="rounded px-1.5 py-0.5 text-xs text-white/60 hover:bg-white/8 hover:text-white"
                aria-label="Increase font"
              >
                A+
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded px-1.5 py-0.5 text-xs text-white/60 hover:bg-white/8 hover:text-white"
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {expanded && (
        <div
          className={`flex-1 overflow-auto whitespace-pre-wrap px-3 py-3 text-left leading-7 ${darkMode ? "bg-black/35 text-white" : "text-white/88"}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {text}
        </div>
      )}
    </div>
  )
}
