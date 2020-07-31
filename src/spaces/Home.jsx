import { Space, Page } from "~components/layout"
import MeFlow from "~flows/Me"
import WriteFlow from "~flows/Write"
import ImagesFlow from "~flows/Images"

export default function HomeSpace() {
  return (
    <Page>
      <Space>
        <MeFlow />
        <WriteFlow />
        <ImagesFlow />
      </Space>
    </Page>
  )
}
