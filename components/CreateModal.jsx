import { useState } from 'react'
import { ReactEditor, Slate } from 'slate-react'
import Editable, { useNewEditor } from "./Editable";
import { useCurrentWorkspace } from '../hooks/app'
import { useWebId } from 'swrlit'

export default function CreateModal({ initialTitle="", create, closeModal}) {
  const editor = useNewEditor()
  const webId = useWebId()
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace()
  const emptySlate = [{ children: [{ text: "" }] }]
  const [title, setTitle] = useState(initialTitle)
  const [slate, setSlate] = useState(emptySlate)
  const [createAnother, setCreateAnother] = useState(false)
  const { concept, saveConcept } = useConcept(webId, slug)
  const resetModal = () => {
    setTitle("")
    setSlate(emptySlate)
  }
  const onSubmit = () => {
    create({title, slate})
    if (createAnother) {
      resetModal()
    } else {
      closeModal()
    }
  }
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  <input className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Note Name" />
                </h3>
                <div className="w-full flex flex-col flex-grow">
                  <Slate
                    editor={editor}
                    value={slate}
                    onChange={(value) => setSlate(value)} >
                    <Editable
                      editor={editor}
                      className="flex-grow text-gray-900" />
                    </Slate>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm" onClick={onSubmit}>
                Create
              </button>
              <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={closeModal}>
                Cancel
              </button>
              <label class="inline-flex items-center">
                <input className="form-checkbox text-indigo-600"
                  type="checkbox"
                  checked={createAnother}
                  onChange={e => setCreateAnother(e.target.checked)} />
                <span class="ml-2">Create another</span>
              </label>
            </div>
          </div>
        </div>
      </div>
  )
}
