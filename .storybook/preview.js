import '../styles/index.css'
import "cropperjs/dist/cropper.css";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#f9fafb',
      },
      {
        name: 'dark',
        value: '#0e90a3',
      },
    ],
  },
}

export const decorators = [
  (Story) => (
    <DndProvider backend={HTML5Backend}>
      <Story/>
    </DndProvider>
  )
]
