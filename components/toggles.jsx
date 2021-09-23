import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { Eyeslash } from './icons'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function PrivacyToggle({ enabled, setEnabled }) {
  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={classNames(
        'bg-white bg-opacity-10 relative inline-flex flex-shrink-0 h-6 w-11 p-0.5 ring-1 ring-white ring-inset rounded-full cursor-pointer transition-colors ease-in-out duration-200'
      )}>
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'flex-grow-0 pointer-events-none inline-block h-5 w-5 p-1 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 flex flex-row items-center justify-center'
        )}>
        {!enabled && (<Eyeslash className="flex-grow-0"/>)}
      </span>
    </Switch>
  )
}