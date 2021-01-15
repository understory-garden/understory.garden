import { useProfile } from 'swrlit'
import { getStringNoLocale } from '@inrupt/solid-client'
import { FOAF } from '@inrupt/vocab-common-rdf'
import Link from 'next/link'

import { profilePath } from '../utils/uris'
import { useFollows } from '../hooks/people'

export function Follow({follow}){
  const { profile } = useProfile(follow)
  const name = profile && getStringNoLocale(profile, FOAF.name)

  return (
    <span>
      <Link href={profilePath(follow)}>
        <a>{name}</a>
      </Link>
    </span>
  )
}

export default function Follows(){
  const follows = useFollows()
  return (
    <div className="px-6">
      {(follows && (follows.length > 0)) ? (
        <ul>
          {
            follows.map(follow => (
              <li key={follow}>
                <Follow follow={follow} />
              </li>
            ))
          }
        </ul>
      ) : (
        "you don't follow anyone yet"
      )}
    </div>
  )
}
