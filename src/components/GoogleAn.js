'use client'

import { Suspense } from 'react'
import GtagScript from './GtagScript'
import PageViewTracker from './PageViewTracker'

export default function GoogleAnalytics() {
  return (
    <>
      <GtagScript />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  )
}
