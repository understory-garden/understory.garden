import { Formik } from 'formik'
import { Search as SearchIcon } from './icons'
import { IconInput } from './inputs'
import { Logo } from './logo'

export default function Header() {
  return (
    <nav className="bg-my-green rounded-b-2xl flex flex-row">
      <div className="w-18 flex flex-col justify-center items-center">
        <Logo className='w-7 transform scale-105' />
      </div>
      <Formik>
        <IconInput type="search" name="search" placeholder="Search"
          icon={<SearchIcon className="text-white" />}
          inputClassName="ipt-header-search my-4" />
      </Formik>
    </nav>
  )
}