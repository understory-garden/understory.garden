import { useState } from 'react'
import { Formik } from 'formik'
import { PrivacyToggle } from '../toggles'
import { Close as CloseIcon } from '../icons'
import { Input } from '../inputs'

export default function NewNoteModal({isPublic=false}) {
  const [pub, setPublic] = useState(isPublic)
  return (
    <div className="rounded-lg overflow-hidden bg-white flex flex-col items-stretch">
      <div className={`flex flex-row justify-between self-stretch h-18 p-6 ${isPublic ? 'bg-my-green' : 'bg-gray-500'}`}>
        <div className="flex flex-row justify-start items-start gap-4">
          <h2 className="text-white font-bold text-xl">New {pub ? 'Public' : 'Private'} Note</h2>
          <PrivacyToggle enabled={pub} setEnabled={setPublic} />
        </div>
        <CloseIcon className="text-white h-6 w-6 flex-grow-0" />
      </div>
      <div className="divide-1 divide-gray-100">
        <Formik>
          <>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start px-6 py-5">
              <label htmlFor="name" className="text-sm font-medium text-gray-900">
                Note Name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <Input
                  type="text"
                  name="name"
                  id="name"
                  className=""
                />
              </div>
            </div>
            <div className="px-6 py-5">
              TODO: note editor here?
            </div>
          </>
        </Formik>
      </div>
    </div>
  )
}