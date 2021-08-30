
import Nav from '../components/nav'

export default function HexGridPage() {
  return (
    <div className="page">
      <Nav />
      <div className="grid hex gap-6 p-6">
        <div><div><h1>1</h1></div></div>
        <div><div><h2>2</h2></div></div>
        <div><div><h3>3</h3></div></div>
        <div><div><h3>4</h3></div></div>
        <div><div><h3>5</h3></div></div>
        <div><div><h3>6</h3></div></div>
        <div><div><h3>7</h3></div></div>
        <div><div><h3>8</h3></div></div>
      </div>
    </div>
  )
}