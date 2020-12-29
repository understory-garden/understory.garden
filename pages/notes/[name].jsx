import { useRouter } from 'next/router'
import Editor from '../../components/Editor';

export default function NotePage(){
  const router = useRouter()
  const { query: { name } } = router
  console.log(name)
  return (
    <div>
      <h1 className="text-5xl">{name}</h1>
      <Editor body={[{children: [{text: "new note..."}]}]}/>
    </div>
  )
}
