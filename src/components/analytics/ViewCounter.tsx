'use client'

import { useEffect, useRef } from 'react'
import { incrementView } from '@/app/actions/analytics'

export default function ViewCounter({ postId }: { postId: string }) {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (!hasIncremented.current) {
            incrementView(postId)
            hasIncremented.current = true
        }
    }, [postId])

    return null
}
