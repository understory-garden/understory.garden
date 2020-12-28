import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  (Story) => (
    <DndProvider backend={HTML5Backend}>
      <Story/>
    </DndProvider>
  )
]
