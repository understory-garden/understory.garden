import { useState } from 'react'
import { Transforms } from 'slate';
import { useEditor, useReadOnly, ReactEditor } from 'slate-react';

export default function VideoElement({attributes, children, element}){
  const readOnly = useReadOnly()
  const editor = useEditor()

  const [url, setUrl] = useState("")
  function save(){
    Transforms.setNodes(editor, { url }, { at: ReactEditor.findPath(editor, element)})
  }
  const youtube = element && element.url && element.url.includes("youtube.com")
  const youtubeId = youtube && new URL(element.url).searchParams.get("v")
  return (
    <div {...attributes}>
      <div contentEditable={false} >
        {(readOnly || element.url) ? (
          youtube ? (
            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${youtubeId}`}
                    frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullscreen></iframe>
          ) : (
            <video controls className="m-auto">
              <source src={element.url} />
            </video>
          )
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
      {children}
    </div>
  )
}
