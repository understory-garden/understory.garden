import { useState } from 'react'
import { useCurrentWorkspace } from '../hooks/app'
import { useWebId } from 'swrlit'
import ModalEditor from './Plate/ModalEditor'

export default function CreateModal({ initialTitle="", create, closeModal}) {
  const webId = useWebId()
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace()
  const emptySlate = [{ children: [{ text: "" }] }]
  const [title, setTitle] = useState(initialTitle)
  const [slate, setSlate] = useState(emptySlate)
  const [createAnother, setCreateAnother] = useState(false)
  const resetModal = () => {
    setTitle("")
    setSlate(emptySlate)
  }
  const onSubmit = () => {
    // create({title, slate})
    if (createAnother) {
      resetModal()
    } else {
      closeModal()
    }
  }
  return (
    <div class="fixed w-full h-full top-0 left-0 flex items-center justify-center">
      <div className="absolute w-full h-full bg-storm opacity-95"></div>
      <div className="flex-column fixed align-bottom min-w-2/5 min-h-1/5 max-w-4/5 max-h-4/5 overflow-y-auto overflow-x-hidden bg-snow z-50 opactiy-100 rounded-lg shadow-xl">
        <button type="button" className="absolute top-0 right-0 cursor-pointer flex flex-col items-center mt-4 mr-4 text-fog text-sm z-50" onClick={closeModal}>
          <svg className="fill-current text-mist" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 18 18">
            <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
          </svg>
        </button>

        <div className="flow-root w-full text-left p-4">
          <ModalEditor/>
        </div>

        <div className="block flex-none bottom-0 right-0 w-full bg-mist px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-echeveria text-base font-medium text-white hover:bg-echeveria :outline-none focus:ring-2 focus:ring-offset-2 focus:ring-echeveria-700 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onSubmit}>
            Create
          </button>
          <button type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-mist shadow-sm px-4 py-2 bg-white text-base font-medium text-storm hover:bg-mist focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={closeModal}>
            Cancel
          </button>
          <label className="inline-flex items-center">
            <input className="form-checkbox text-echeveria"
              type="checkbox"
              checked={createAnother}
              onChange={e => setCreateAnother(e.target.checked)} />
            <span class="ml-2">Create another</span>
          </label>
        </div>
      </div>
    </div>
  )
}
