import { useState } from 'react'
import { Transforms } from 'slate';
import { useEditor, useReadOnly, ReactEditor } from 'slate-react';

export default function VideoElement({attributes, children, element}){
  const readOnly = useReadOnly()
  const editor = useEditor()

  const path = ReactEditor.findPath(editor, element)
  const [url, setUrl] = useState("")
  function save(){
    Transforms.setNodes(editor, { url }, { at: path })

  }
  return (
    <div contentEditable={false}>
      {(readOnly || element.url) ? (
        <video controls className="m-auto">
          <source src={element.url} />
        </video>
      ) : (
        <div className="flex flex-row">
          <input type="url" placeholder="paste video url here..."
                 className="bg-gray-500 text-white placeholder-gray-300 flex-grow rounded-lg"
                 value={url}
                 onChange={e => setUrl(e.target.value)}
          />
          <button className="ml-3 btn" onClick={save}>
            save
          </button>
        </div>
      )}
    </div>
  )
}
