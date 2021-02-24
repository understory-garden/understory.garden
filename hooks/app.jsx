import { useEffect } from "react"
import { useItmeContainerUri, useConceptContainerUri } from './uris'
import { useThing, useResource, useWebId } from 'swrlit'
import {
  createSolidDataset, getSourceUrl, createThing, getThingAll, getDatetime, getUrl, setUrl,
  setThing
} from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { WS } from '@inrupt/lit-generated-vocab-solid-common'
import { ITME } from '../vocab'

const appThingName = "app"

function ensureApp(webId){
  const appContainerUri = useItmeContainerUri(webId)
  const appUri = appContainerUri && `${appContainerUri}app.ttl`
  const {resource, save, error, ...rest} = useResource(appUri)

  useEffect(function(){
    if (appContainerUri && error && (error.statusCode === 404)) {
      let app = createThing({name: appThingName})
      let defaultWorkspace = createThing()
      const workspacePrefs = `${appContainerUri}workspace/default/prefs.ttl`
      defaultWorkspace = setUrl(defaultWorkspace, WS.preferencesFile, workspacePrefs)
      app = setUrl(app, ITME.hasWorkspace, defaultWorkspace)
      let newResource = createSolidDataset()
      newResource = setThing(newResource, defaultWorkspace)
      newResource = setThing(newResource, app)
      save(newResource)
    }
  }, [error, save, appContainerUri])

  return resource && getSourceUrl(resource)
}

export function useApp(webId){
  const appResourceUri = ensureApp(webId)
  const appUri = appResourceUri && `${appResourceUri}#${appThingName}`
  const {thing, error, save, ...rest} = useThing(appUri)

  return {app: thing, error, save, ...rest}
}

const prefsWorkspaceName = "workspace"

export function useWorkspacePreferencesFileUri(webId, workspaceSlug){
  const { app } = useApp(webId)
  // we're ignoring the workspaceSlug parameter for now, but eventually we'll want to use this to get the currect workspace
  const { thing: workspaceInfo } = useThing(app && getUrl(app, ITME.hasWorkspace))
  return workspaceInfo && getUrl(workspaceInfo, WS.preferencesFile)
}

function ensureWorkspace(webId, workspaceSlug){
  const workspacePreferencesFileUri = useWorkspacePreferencesFileUri(webId, workspaceSlug)
  const {resource, save, error, ...rest} = useResource(workspacePreferencesFileUri)

  useEffect(function(){
    if (workspacePreferencesFileUri && error && (error.statusCode === 404)) {
      let prefsFile = createSolidDataset()
      let workspace = createThing({name: prefsWorkspaceName})
      workspace = setUrl(workspace, ITME.conceptIndex, new URL("concepts.ttl", workspacePreferencesFileUri).toString())
      workspace = setUrl(workspace, ITME.tagIndex, new URL("tags.ttl", workspacePreferencesFileUri).toString())
      workspace = setUrl(workspace, ITME.defaultNoteStorage, new URL("notes/", workspacePreferencesFileUri).toString())
      prefsFile = setThing(prefsFile, workspace)
      save(prefsFile)
    }
  }, [error, save, workspacePreferencesFileUri])

  return resource && getSourceUrl(resource)
}

export function useWorkspace(webId, workspaceSlug){
  const workspacePreferencesFileUri = ensureWorkspace(webId, workspaceSlug)
  const { thing: workspace, ...rest } = useThing(workspacePreferencesFileUri && `${workspacePreferencesFileUri}#workspace`)

  return { workspace, ...rest }

}
