import { Space } from "~components/layout"
import MeFlow from "~flows/Me"
import PodsFlow from "~flows/Pods"
import WriteFlow from "~flows/Write"
import ImagesFlow from "~flows/Images"

export default function HomeSpace() {
  return (
    <Space>
      <MeFlow />
      <PodsFlow className="motion-safe:animate-slide-flow-in" />
      <WriteFlow className="motion-safe:animate-slide-flow-in" />
      <ImagesFlow className="motion-safe:animate-slide-flow-in" />
    </Space>
  )
}
