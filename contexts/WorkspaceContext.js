import { createContext, useContext } from 'react'
import { useWorkspace } from '../hooks/app'

const WorkspaceContext = createContext({slug: 'default', workspace: null})


export function WorkspaceProvider({webId, slug, ...rest}){
  const { workspace } = useWorkspace(webId, slug)
  return (
      <WorkspaceContext.Provider value={{webId, slug, workspace}} {...rest}/>
  )
}

export const useWorkspaceContext = () => useContext(WorkspaceContext)

export default WorkspaceContext;
