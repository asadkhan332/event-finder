'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type EditEventButtonProps = {
  eventId: string
  organizerId: string
}

export default function EditEventButton({ eventId, organizerId }: EditEventButtonProps) {
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    async function checkPermissions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCanEdit(user.id === organizerId)
      }
    }
    checkPermissions()
  }, [organizerId])

  if (!canEdit) {
    return null
  }

  return (
    <Link
      href={`/events/${eventId}/edit`}
      className="inline-flex items-center gap-2 px-4 py-2 text-karachi-orange border border-karachi-orange rounded-lg hover:bg-karachi-orange hover:text-white transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit Event
    </Link>
  )
}
