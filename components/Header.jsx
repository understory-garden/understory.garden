import { Formik}  from 'formik'
import { Search as SearchIcon } from './icons'
import { IconInput } from './inputs'

export default function Header() {
  return (
    <nav className="bg-my-green rounded-b-lg flex flex-row my-4">
      <Formik>
        <IconInput type="search" name="search" placeholder="Search"
          icon={<SearchIcon className="text-white" />}
          className="ipt-header-search" />
      </Formik>
    </nav>
  )
}