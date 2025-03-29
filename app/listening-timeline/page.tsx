// page.tsx
"use client";

import { Suspense } from 'react';
import { ListeningTimelineContent } from './listening-timeline-content';

export default function ListeningTimelinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListeningTimelineContent />
    </Suspense>
  );
}