"use client"

import type { RealtimeChannel } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type MeetingLiveSharePayload = {
  active: boolean
  frame: string | null
  sourceLabel?: string | null
  updatedAt: number
}

const SCREEN_SHARE_EVENT = "screen-share"

export function createMeetingLiveChannel(
  meetingId: string,
  onScreenShare: (payload: MeetingLiveSharePayload) => void
): RealtimeChannel {
  const client = createClient()
  const channel = client.channel(`meeting-live:${meetingId}`, {
    config: {
      broadcast: {
        self: false,
      },
    },
  })

  channel.on("broadcast", { event: SCREEN_SHARE_EVENT }, ({ payload }) => {
    onScreenShare(payload as MeetingLiveSharePayload)
  })

  void channel.subscribe()
  return channel
}

export async function broadcastMeetingScreenShare(
  channel: RealtimeChannel,
  payload: MeetingLiveSharePayload
): Promise<void> {
  await channel.send({
    type: "broadcast",
    event: SCREEN_SHARE_EVENT,
    payload,
  })
}
