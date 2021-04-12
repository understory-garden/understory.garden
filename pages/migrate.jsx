import { useItmeOnlineConceptIndex, ItmeOnlineMigrator } from '../components/ItmeOnlineMigrator'
import { DowncaseMigrator } from '../components/DowncaseMigrator'
import Nav from '../components/nav'

export default function MigratePage(){

  return (
    <div className="page">
      <Nav/>
      <DowncaseMigrator/>
    </div>

  )
}
