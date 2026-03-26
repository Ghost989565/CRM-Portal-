"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Phone, Mail, MessageSquare, Calendar, FileText, Upload, Download, Clock, Tag, User } from "lucide-react"
import { type Client, statusOptions, stageOptions } from "@/lib/crm-data"

type ApiClientFile = {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  downloadUrl?: string | null
}

interface ClientProfileSheetProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

export function ClientProfileSheet({ client, isOpen, onClose }: ClientProfileSheetProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [notes, setNotes] = useState("")
  const [files, setFiles] = useState<ApiClientFile[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSendingText, setIsSendingText] = useState(false)
  const [smsMessage, setSmsMessage] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!client) return

    const stored = localStorage.getItem(`client-notes-${client.id}`)
    setNotes(stored ?? client.notes ?? "")
    setFeedback(null)
    setFiles(client.files || [])
    setSmsMessage(`Hi ${client.firstName}, just checking in from Pantheon CRM.`)
  }, [client])

  useEffect(() => {
    if (!client || !isOpen) return

    const controller = new AbortController()

    const loadFiles = async () => {
      setFilesLoading(true)
      try {
        const response = await fetch(`/api/clients/${client.id}/files`, {
          signal: controller.signal,
          cache: "no-store",
        })

        const payload = (await response.json()) as { error?: string; files?: ApiClientFile[] }
        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch files")
        }

        setFiles(payload.files || [])
      } catch (error) {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : "Failed to load files"
        setFeedback(message)
      } finally {
        if (!controller.signal.aborted) {
          setFilesLoading(false)
        }
      }
    }

    void loadFiles()

    return () => controller.abort()
  }, [client, isOpen])

  const defaultSmsUri = useMemo(() => {
    if (!client?.phone) return ""
    return `sms:${client.phone}`
  }, [client?.phone])

  if (!client) return null

  const handleAction = async (action: "call" | "text" | "email") => {
    if (action === "call") {
      window.open(`tel:${client.phone}`)
      return
    }

    if (action === "email") {
      window.open(`mailto:${client.email}?subject=Pantheon%20CRM%20Follow-up`)
      return
    }

    setIsSendingText(true)
    setFeedback(null)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          message: smsMessage,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        configured?: boolean
        fallbackUri?: string
      }

      if (!response.ok) {
        throw new Error(payload.error || "Failed to send text message")
      }

      if (payload.configured === false) {
        window.open(payload.fallbackUri || defaultSmsUri)
        setFeedback("Twilio is not configured. Opened your device SMS app instead.")
        return
      }

      setFeedback("Text message sent successfully.")
    } catch {
      if (defaultSmsUri) {
        window.open(defaultSmsUri)
        setFeedback("Text API failed. Opened your device SMS app instead.")
      } else {
        setFeedback("Unable to send text because this client has no phone number.")
      }
    } finally {
      setIsSendingText(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  const handleUpload = async (file?: File) => {
    if (!file) return

    setIsUploading(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/clients/${client.id}/files`, {
        method: "POST",
        body: formData,
      })

      const payload = (await response.json()) as { error?: string; file?: ApiClientFile }
      if (!response.ok || !payload.file) {
        throw new Error(payload.error || "Failed to upload file")
      }

      setFiles((prev) => [payload.file, ...prev])
      setFeedback("File uploaded successfully.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload file"
      setFeedback(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveNotes = () => {
    localStorage.setItem(`client-notes-${client.id}`, notes)
    setFeedback("Notes saved on this device.")
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {client.firstName[0]}
                {client.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">
                {client.firstName} {client.lastName}
              </SheetTitle>
              <SheetDescription className="space-y-1">
                <div>{client.email}</div>
                <div>{client.phone}</div>
              </SheetDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={client.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select defaultValue={client.stage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              <Button size="sm" variant="outline" className="h-6 bg-transparent">
                <Tag className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" onClick={() => void handleAction("call")}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button size="sm" variant="outline" onClick={() => void handleAction("text")} disabled={isSendingText}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {isSendingText ? "Sending..." : "Text"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void handleAction("email")}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Text Message</Label>
            <Textarea
              value={smsMessage}
              onChange={(event) => setSmsMessage(event.target.value)}
              placeholder="Write a quick SMS follow-up..."
              rows={2}
            />
          </div>

          {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assigned Agent</Label>
                    <p className="text-sm font-medium">{client.assignedAgent}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm text-muted-foreground">{formatDateTime(client.createdAt)}</p>
                  </div>
                  <div>
                    <Label>Last Contact</Label>
                    <p className="text-sm text-muted-foreground">
                      {client.lastContact ? formatDateTime(client.lastContact) : "Never"}
                    </p>
                  </div>
                  <div>
                    <Label>Next Appointment</Label>
                    <p className="text-sm text-muted-foreground">
                      {client.nextAppointment ? formatDateTime(client.nextAppointment) : "None scheduled"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Client Notes
                </CardTitle>
                <CardDescription>Keep track of important information about this client</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this client..."
                  rows={8}
                />
                <div className="flex justify-end mt-4">
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                  </div>
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        void handleUpload(file)
                        event.target.value = ""
                      }}
                    />
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading files...</div>
                ) : files.length > 0 ? (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.type} • {formatDateTime(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!file.downloadUrl}
                          onClick={() => {
                            if (file.downloadUrl) {
                              window.open(file.downloadUrl, "_blank", "noopener,noreferrer")
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No files uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointments
                  </div>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Contact Timeline
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.contactHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contact history recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {client.contactHistory.map((contact) => (
                      <div key={contact.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          {contact.type === "call" && <Phone className="h-4 w-4 text-accent" />}
                          {contact.type === "email" && <Mail className="h-4 w-4 text-accent" />}
                          {contact.type === "text" && <MessageSquare className="h-4 w-4 text-accent" />}
                          {contact.type === "meeting" && <Calendar className="h-4 w-4 text-accent" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm capitalize">{contact.type}</p>
                            <p className="text-xs text-muted-foreground">{contact.timestamp}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{contact.outcome}</p>
                          {contact.notes && <p className="text-xs text-muted-foreground mt-2 italic">{contact.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
