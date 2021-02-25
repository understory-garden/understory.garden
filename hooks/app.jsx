import { useEffect } from "react"
import { useItmeContainerUri, useConceptContainerUri, useStorageContainer } from './uris'
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
  const privateAppContainerUri = useItmeContainerUri(webId, 'private')

  useEffect(function(){
    if (appContainerUri && error && (error.statusCode === 404)) {
      let app = createThing({name: appThingName})
      let defaultWorkspace = createThing()
      const prefsPath = "workspace/default/prefs.ttl"
      defaultWorkspace = setUrl(defaultWorkspace, ITME.publicPrefs, `${appContainerUri}${prefsPath}`)
      defaultWorkspace = setUrl(defaultWorkspace, ITME.privatePrefs, `${privateAppContainerUri}${prefsPath}`)
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

export function useWorkspacePreferencesFileUris(webId, workspaceSlug='default'){
  const { app } = useApp(webId)
  // we're ignoring the workspaceSlug parameter for now, but eventually we'll want to use this to get the currect workspace
  const { thing: workspaceInfo } = useThing(app && getUrl(app, ITME.hasWorkspace))
  return {
    public: workspaceInfo && getUrl(workspaceInfo, ITME.publicPrefs),
    private: workspaceInfo && getUrl(workspaceInfo, ITME.privatePrefs)
  }
}

function useConceptPrefix(webId, workspaceSlug){
  const storageContainerUri = useStorageContainer(webId)
  return storageContainerUri && `${storageContainerUri}/itme/${workspaceSlug}/concepts#`
}

function ensureWorkspace(webId, storage, workspaceSlug='default'){
  const workspacePreferencesFileUris = useWorkspacePreferencesFileUris(webId, workspaceSlug)
  const workspacePreferencesFileUri = workspacePreferencesFileUris && workspacePreferencesFileUris[storage]
  const {resource, save, error, ...rest} = useResource(workspacePreferencesFileUri && workspacePreferencesFileUri)
  const conceptPrefix = useConceptPrefix(webId, workspaceSlug)

  useEffect(function(){
    if (workspacePreferencesFileUri && conceptPrefix && error && (error.statusCode === 404)) {
      let prefsFile = createSolidDataset()
      let workspace = createThing({name: prefsWorkspaceName})
      workspace = setUrl(workspace, ITME.conceptPrefix, conceptPrefix)
      workspace = setUrl(workspace, ITME.conceptIndex, new URL("concepts.ttl", workspacePreferencesFileUri).toString())
      workspace = setUrl(workspace, ITME.noteStorage, new URL("notes/", workspacePreferencesFileUri).toString())
      workspace = setUrl(workspace, ITME.backupsStorage, new URL(`backups/`, workspacePreferencesFileUri).toString())
      prefsFile = setThing(prefsFile, workspace)
      save(prefsFile)
    }
  }, [error, save, workspacePreferencesFileUri, conceptPrefix])

  return resource && getSourceUrl(resource)
}

export function useWorkspace(webId, workspaceSlug='default'){
  const workspacePreferencesFileUri = ensureWorkspace(webId, 'public', workspaceSlug)
  const { thing: workspace, ...rest } = useThing(workspacePreferencesFileUri && `${workspacePreferencesFileUri}#workspace`)

  return { workspace, ...rest }

}
