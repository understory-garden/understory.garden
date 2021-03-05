import { useItmeOnlineConceptIndex, ItmeOnlineMigrator } from '../components/ItmeOnlineMigrator'
import Nav from '../components/nav'

export default function MigratePage(){

  return (
    <div className="page">
      <Nav/>
      <ItmeOnlineMigrator/>
    </div>

  )
}
