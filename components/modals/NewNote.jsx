import { useState } from 'react'
import { PrivacyToggle } from '../toggles'
import { Close as CloseIcon } from '../icons'

export default function NewNoteModal() {
  const [pub, setPublic] = useState(false)
  return (
    <div className="rounded-lg overflow-hidden bg-white flex flex-col items-stretch">
      <div className="flex flex-row justify-between self-stretch h-18 p-6 bg-gray-500">
        <div className="flex flex-row justify-start items-start gap-4">
          <h2 className="text-white font-bold text-xl">New {pub ? 'Public' : 'Private'} Note</h2>
          <PrivacyToggle enabled={pub} setEnabled={setPublic} />
        </div>
        <CloseIcon className="text-white h-6 w-6 flex-grow-0"/>
      </div>
      <div className="flex flex-col ">
        Note Name
      </div>
    </div>
  )
}