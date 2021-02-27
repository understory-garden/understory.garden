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

const prefsPath = "workspace/default/prefs.ttl"
const prefsWorkspaceName = "workspace"

function createNewAppResource(appContainerUri, privateAppContainerUri){
  let app = createThing({name: appThingName})
  let defaultWorkspace = createThing()
  defaultWorkspace = setUrl(defaultWorkspace, US.publicPrefs, `${appContainerUri}${prefsPath}`)
  defaultWorkspace = setUrl(defaultWorkspace, US.privatePrefs, `${privateAppContainerUri}${prefsPath}`)
  app = setUrl(app, US.hasWorkspace, defaultWorkspace)
  let resource = createSolidDataset()
  resource = setThing(resource, defaultWorkspace)
  resource = setThing(resource, app)
  return {app, resource}
}

function createWorkspacePrefs(conceptPrefix, workspacePreferencesFileUri){
  let workspace = createThing({name: prefsWorkspaceName})
  workspace = setUrl(workspace, US.conceptPrefix, conceptPrefix)
  workspace = setUrl(workspace, US.conceptIndex, new URL("concepts.ttl", workspacePreferencesFileUri).toString())
  workspace = setUrl(workspace, US.noteStorage, new URL("notes/", workspacePreferencesFileUri).toString())
  workspace = setUrl(workspace, US.backupsStorage, new URL(`backups/`, workspacePreferencesFileUri).toString())
  return workspace
}

export function useApp(webId){
  const appContainerUri = useUnderstoryContainerUri(webId)
  const privateAppContainerUri = useUnderstoryContainerUri(webId, 'private')

  const publicWorkspacePrefsUri = appContainerUri && `${appContainerUri}${prefsPath}#${prefsWorkspaceName}`
  const {save: savePublicPrefs} = useThing(publicWorkspacePrefsUri)
  const privateWorkspacePrefsUri = privateAppContainerUri && `${privateAppContainerUri}${prefsPath}#${prefsWorkspaceName}`
  const {save: savePrivatePrefs} = useThing(privateWorkspacePrefsUri)
  const appUri = appContainerUri && `${appContainerUri}app.ttl#${appThingName}`
  const {thing: app, saveResource: saveAppResource, ...rest} = useThing(appUri)
  const conceptPrefix = useConceptPrefix(webId, 'default')

  async function initApp(){
    const { resource: appResource } = createNewAppResource(appContainerUri, privateAppContainerUri)
    await saveAppResource(appResource)
    const privatePrefs = createWorkspacePrefs(conceptPrefix, privateWorkspacePrefsUri)
    await savePrivatePrefs(privatePrefs)
    const publicPrefs = createWorkspacePrefs(conceptPrefix, publicWorkspacePrefsUri)
    await savePublicPrefs(publicPrefs)
    console.log("initialized!")
  }

  return {app, initApp, saveResource: saveAppResource, ...rest}
}


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

export function useWorkspace(webId, workspaceSlug, storage='public'){
  const workspacePreferencesFileUris = useWorkspacePreferencesFileUris(webId, workspaceSlug)
  const workspacePreferencesFileUri = workspacePreferencesFileUris && workspacePreferencesFileUris[storage]
  const { thing: workspace, ...rest } = useThing(workspacePreferencesFileUri)

  return { workspace, ...rest }

}
