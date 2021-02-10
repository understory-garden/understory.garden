import Nav from '../components/nav'

export default function PrivacyPage(){
  return (
    <div className="page">
      <Nav/>
      <div className="flex flex-col text-center">
        <h3 className="text-5xl my-12">privacy at itme.online</h3>
        <p className="text-2xl my-6">
          itme.online doesn't store your data - everything you create here
          is stored in your <a href="https://solidproject.org/">Solid Pod</a>.
        </p>
      </div>
    </div>
  )
}
