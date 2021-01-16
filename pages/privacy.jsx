import Nav from '../components/nav'
import { useWebId, useLoggedIn } from 'swrlit'

export default function PrivacyPage(){
  const webId = useWebId()
  const loggedIn = useLoggedIn()
  return (
    <div className="page">
      <Nav/>
      <div className="flex flex-col text-center">
        <h3 className="text-5xl my-12">privacy at face.baby</h3>
        <p className="text-2xl my-6">
          We are dedicated to providing you our commitment to the highest
          standards for privacy and the protection of your digital soul. We
          certainly wouldn't want anything bad to happen to it!
        </p>
        <p className="text-2xl my-6">
          face.baby is built on decentralized web technology that gives you
          the ultimate in control over your succulent digital body.
        </p>
        {loggedIn ? (
          <p className="text-2xl my-6">
            To adjust your privacy settings, simply use our&nbsp;
            <a href={webId} target="_blank">
              digital access control list administration user interface
            </a>
            . Simply log in to the administrative interface with your face.baby
            account and get started managing your access control lists today - it
            couldn't be easier!
          </p>
        ) : (
          <p className="text-2xl my-6">
            Take control of your digital destiny today! Join face.baby and
            monetize your digital soul!
          </p>
        )}
      </div>
    </div>
  )
}
