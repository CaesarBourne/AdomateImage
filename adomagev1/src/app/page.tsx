import EditorPage from '@/components/editor/EditorPage'
import { ModeToggle } from '@/components/modeToggle'
import React from 'react'

const page = () => {
  return (
    <div>
      <ModeToggle/>
      <EditorPage/>
    </div>
  )
}

export default page