import { Flow, Module } from "~components/layout"
import { AuthButton } from "~components/elements"

export default () => {
  return (
    <Flow>
      <Module>
        <img className="object-contain h-32 pb-6 flex-grow" src="/itme.png" alt="itme's logo" />
        <AuthButton />
      </Module>
    </Flow>
  )
}
