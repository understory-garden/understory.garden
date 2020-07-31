import { Space } from "~components/layout"
import MeFlow from "~flows/Me"
import WriteFlow from "~flows/Write"
import ImagesFlow from "~flows/Images"

export default function HomeSpace() {
  return (
    <Space>
      <MeFlow />
      <WriteFlow />
      <ImagesFlow />
    </Space>
  )
}
