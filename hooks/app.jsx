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

export function useWorkspacePreferencesFileUri(webId){
  const { app } = useApp(webId)
  const { thing: workspaceInfo } = useThing(app && getUrl(app, ITME.hasWorkspace))
  return workspaceInfo && getUrl(workspaceInfo, WS.preferencesFile)
}

function ensureWorkspace(webId){
  const workspacePreferencesFileUri = useWorkspacePreferencesFileUri(webId)
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

export function useWorkspace(webId){
  const workspacePreferencesFileUri = ensureWorkspace(webId)
  const { thing: workspace, ...rest } = useThing(workspacePreferencesFileUri && `${workspacePreferencesFileUri}#workspace`)

  return { workspace, ...rest }

}
