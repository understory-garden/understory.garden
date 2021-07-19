import { useState } from 'react'
import Link from 'next/link'

import { getUrl, getSourceUrl, getBoolean } from '@inrupt/solid-client'
import { FOAF, LDP } from '@inrupt/vocab-common-rdf'
import { Transition } from '@headlessui/react'
import { useAuthentication, useLoggedIn, useMyProfile, useContainer, useWebId } from 'swrlit'
import { useRouter } from 'next/router'
import Image from 'next/image'

import { MailIcon } from '../components/icons'
import NewNoteForm from '../components/NewNoteForm'
import { useApp, useWorkspacePreferencesFileUris, useAppSettings } from '../hooks/app'
import { deleteResource } from '../utils/fetch'
import { appPrefix } from '../utils/uris'
import { US } from '../vocab'

function DevTools() {
  const webId = useWebId()

  const { resource: appResource } = useApp(webId)
  const { public: workspacePreferencesFileUri } = useWorkspacePreferencesFileUris(webId)
  return (
    <ul className="flex flex-column">
      <li className="mx-3">
        prefix: {appPrefix}
      </li>
      <li>
        <button className="btn text-xs" onClick={() => deleteResource(getSourceUrl(appResource))}>
          delete app file
        </button>
      </li>
      <li>
        <button className="btn text-xs" onClick={() => deleteResource(workspacePreferencesFileUri)}>
          delete default workspace
        </button>
      </li>
    </ul>
  )
}

function CreateButton({onClick}) {
  return (
    <div className="flex flex-row max-h-9 self-center">
      <button className="flex btn text-l h-9" onClick={onClick}>
        Create
      </button>
    </div>
  )
}

export function Modal({ submitTitle="Submit", onSubmit, onCancel}  ) {
  return (
    <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Whoa a concept
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo pariatur iste dolorem animi vitae error totam. At sapiente aliquam accusamus facere veritatis.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm" onClick={onSubmit}>
             { submitTitle }
            </button>
            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Nav() {
  const router = useRouter()
  const { query: { devtools } } = router
  const webId = useWebId()
  const { settings } = useAppSettings(webId)
  const devModeSetting = settings && getBoolean(settings, US.devMode)
  const loggedIn = useLoggedIn()
  const { logout } = useAuthentication()
  const { profile } = useMyProfile()
  const profileImage = profile && getUrl(profile, FOAF.img)
  const inboxUri = profile && getUrl(profile, LDP.inbox)
  const { resources } = useContainer(inboxUri)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <nav className="pt-3 flex flex-col">
      <ul className="flex justify-between items-center">
        {modalOpen && (
          <Modal onSubmit={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}/>
        )}
        <li className="flex flex-row">
          <Link href="/">
            <a className="mr-6">
              <Image src="/logo.png"
                alt="a logo consisting of a multi-colored mushroom with roots digging deep into the understory"
                width={60}
                height={60}
              />
            </a>
          </Link>
          {loggedIn && (
            <NewNoteForm />
          )}
          {loggedIn && (
            <CreateButton onClick={() => {
              console.log('setModalOpen')
              setModalOpen(true)}
              }
            />
          )}
        </li>
        <li>
          <ul className="flex justify-between items-center space-x-4">
            {loggedIn && (
              <div>
                {profileImage ? (
                  <img src={profileImage}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-full h-12 w-12 object-cover cursor-pointer" />
                ) : (
                  <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}>
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                )}
                <Transition
                  show={menuOpen}
                  enter="transition ease-out duration-100"
                  enterFrom="translate-x-transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95">
                  {
                    (ref) => (
                      <div ref={ref} className="z-30 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="p-1 text-lg" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <Link href="/profile">
                            <a className="block hover:bg-gray-100 hover:text-gray-900">
                              edit profile
                          </a>
                          </Link>
                          <Link href="/settings">
                            <a className="block hover:bg-gray-100 hover:text-gray-900">
                              settings
                          </a>
                          </Link>
                          <a href="/privacy" className="block hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                            privacy
                        </a>
                          <a href="/tos" className="block hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                            terms of service
                        </a>
                          {loggedIn && (
                            <button type="submit" className="block w-full text-left text-purple-500 font-semibold hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem"
                              onClick={logout}>
                              log out
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  }
                </Transition>
              </div>
            )}
          </ul>
        </li>
      </ul>
      { (devtools || devModeSetting) && <DevTools />}
    </nav >
  )
}
