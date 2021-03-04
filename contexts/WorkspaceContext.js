import { createContext, useContext, useMemo } from 'react'
import { useWorkspace } from '../hooks/app'
import { asUrl } from '@inrupt/solid-client'

const WorkspaceContext = createContext({slug: 'default', workspace: null})


export function WorkspaceProvider({webId, slug, ...rest}){
  const { workspace } = useWorkspace(webId, slug)
  const value = useMemo(() => ({webId, slug, workspace}), [webId, slug, workspace && asUrl(workspace)])
  return (
      <WorkspaceContext.Provider value={value} {...rest}/>
  )
}

export const useWorkspaceContext = () => useContext(WorkspaceContext)

export default WorkspaceContext;
