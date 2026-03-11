"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { scriptCategories, type Script } from "@/lib/scripts-data"

interface AddScriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddScript: (script: Script) => void
  defaultAuthor?: string
  initialScript?: Script | null
  dialogTitle?: string
  dialogDescription?: string
  submitLabel?: string
}

export function AddScriptDialog({
  open,
  onOpenChange,
  onAddScript,
  defaultAuthor = "You",
  initialScript = null,
  dialogTitle = "New Script",
  dialogDescription = "Add a new script to your library. Scripts help you stay consistent in presentations, calls, and communications.",
  submitLabel = "Add Script",
}: AddScriptDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Script["category"]>("presentation")
  const [content, setContent] = useState("")
  const [tagsInput, setTagsInput] = useState("")

  const resetForm = () => {
    setTitle("")
    setCategory("presentation")
    setContent("")
    setTagsInput("")
  }

  useEffect(() => {
    if (!open) return
    if (initialScript) {
      setTitle(initialScript.title)
      setCategory(initialScript.category)
      setContent(initialScript.content)
      setTagsInput(initialScript.tags.join(", "))
      return
    }
    resetForm()
  }, [open, initialScript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const tags = tagsInput
      .split(/[,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)

    const now = new Date().toISOString()
    const newScript: Script = {
      id: initialScript?.id || `script-${Date.now()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      tags,
      createdAt: initialScript?.createdAt || now,
      updatedAt: now,
      author: initialScript?.author || defaultAuthor,
      isTemplate: initialScript?.isTemplate ?? false,
      usageCount: initialScript?.usageCount ?? 0,
    }

    onAddScript(newScript)
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script-title">Title</Label>
            <Input
              id="script-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Opening for product demo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="script-category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Script["category"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scriptCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="script-content">Content</Label>
            <p className="text-xs text-muted-foreground">
              Use {"{{name}}"}, {"{{firstName}}"}, or {"{{lastName}}"} to personalize when sending to clients via text.
            </p>
            <Textarea
              id="script-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your script text..."
              rows={8}
              className="font-mono text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="script-tags">Tags (comma separated)</Label>
            <Input
              id="script-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. opening, demo, life insurance"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !content.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
