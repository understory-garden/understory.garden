import { useEffect, useState } from "react"
import { useUnderstoryContainerUri, useConceptContainerUri, useStorageContainer } from './uris'
import { useThing, useResource, useWebId } from 'swrlit'
import {
  createSolidDataset, getSourceUrl, createThing, getThingAll, getDatetime, getUrl, setUrl,
  setThing
} from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { WS } from '@inrupt/lit-generated-vocab-solid-common'
import { US } from '../vocab'
import { appPrefix } from '../utils/uris'

const appThingName = "app"

function ensureApp(webId){
  const appContainerUri = useUnderstoryContainerUri(webId)
  const appUri = appContainerUri && `${appContainerUri}app.ttl`
  const {resource, save, error, ...rest} = useResource(appUri)
  const privateAppContainerUri = useUnderstoryContainerUri(webId, 'private')
  const [creating, setCreating] = useState(false)

  useEffect(function(){
    if (!creating && appContainerUri && error && (error.statusCode === 404)) {
      console.log("creating prefs")
      setCreating(true)
      let app = createThing({name: appThingName})
      let defaultWorkspace = createThing()
      const prefsPath = "workspace/default/prefs.ttl"
      defaultWorkspace = setUrl(defaultWorkspace, US.publicPrefs, `${appContainerUri}${prefsPath}`)
      defaultWorkspace = setUrl(defaultWorkspace, US.privatePrefs, `${privateAppContainerUri}${prefsPath}`)
      app = setUrl(app, US.hasWorkspace, defaultWorkspace)
      let newResource = createSolidDataset()
      newResource = setThing(newResource, defaultWorkspace)
      newResource = setThing(newResource, app)
      save(newResource).then(() => setCreating(false))
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
  const { thing: workspaceInfo } = useThing(app && getUrl(app, US.hasWorkspace))
  return {
    public: workspaceInfo && getUrl(workspaceInfo, US.publicPrefs),
    private: workspaceInfo && getUrl(workspaceInfo, US.privatePrefs)
  }
}

function useConceptPrefix(webId, workspaceSlug){
  const storageContainerUri = useStorageContainer(webId)
  return storageContainerUri && `${storageContainerUri}${appPrefix}/${workspaceSlug}/concepts#`
}

function ensureWorkspace(webId, workspaceSlug, storage){
  const workspacePreferencesFileUris = useWorkspacePreferencesFileUris(webId, workspaceSlug)
  const workspacePreferencesFileUri = workspacePreferencesFileUris && workspacePreferencesFileUris[storage]
  const {resource, save, error, ...rest} = useResource(workspacePreferencesFileUri && workspacePreferencesFileUri)
  const conceptPrefix = useConceptPrefix(webId, workspaceSlug)

  useEffect(function(){
    if (workspacePreferencesFileUri && conceptPrefix && error && (error.statusCode === 404)) {
      let prefsFile = createSolidDataset()
      let workspace = createThing({name: prefsWorkspaceName})
      workspace = setUrl(workspace, US.conceptPrefix, conceptPrefix)
      workspace = setUrl(workspace, US.conceptIndex, new URL("concepts.ttl", workspacePreferencesFileUri).toString())
      workspace = setUrl(workspace, US.noteStorage, new URL("notes/", workspacePreferencesFileUri).toString())
      workspace = setUrl(workspace, US.backupsStorage, new URL(`backups/`, workspacePreferencesFileUri).toString())
      prefsFile = setThing(prefsFile, workspace)
      save(prefsFile)
    }
  }, [error, save, workspacePreferencesFileUri, conceptPrefix])

  return resource && getSourceUrl(resource)
}

export function useWorkspace(webId, workspaceSlug, storage='public'){
  const workspacePreferencesFileUri = ensureWorkspace(webId, workspaceSlug, storage)
  const { thing: workspace, ...rest } = useThing(workspacePreferencesFileUri && `${workspacePreferencesFileUri}#workspace`)

  return { workspace, ...rest }

}
