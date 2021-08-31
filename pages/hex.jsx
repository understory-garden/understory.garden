
import Nav from '../components/nav'


export function Hex({children}) {
  return (
    <div><div>
      <div className="flex flex-col justify-center items-center">
        {children}
      </div>
    </div></div>
  )
}

export default function HexGridPage() {
  return (
    <div className="page">
      <Nav />
      <div className="grid hex gap-6 p-6">
        {[...Array(9).keys()].map(n => <Hex><h1>NOTE {n}</h1></Hex>)}
      </div>
    </div>
  )
}