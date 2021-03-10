import { useRef, useEffect } from 'react'
import { useThing, useWebId } from 'swrlit'
import { getUrl, getStringNoLocale, setStringNoLocale, setDatetime, createThing } from '@inrupt/solid-client'
import { useConcept } from '../hooks/concepts'
import { useCurrentWorkspace } from '../hooks/app'
import { US } from '../vocab'
import { conceptNameToUrlSafeId } from '../utils/uris'
import { DCTERMS } from '@inrupt/vocab-common-rdf'

const EVERY_MINUTE = 60 * 1000
const EVERY_FIVE_MINUTES = 5 * EVERY_MINUTE
const EVERY_TEN_MINUTES = 10 * EVERY_MINUTE
const EVERY_THIRTY_MINUTES = 30 * EVERY_MINUTE

const backupThing = 'backup'

async function createBackup(conceptUri, saveBackup, body) {
  let backup = createThing({name: backupThing})
  backup = setDatetime(backup, DCTERMS.created, new Date())
  backup = setStringNoLocale(backup, US.noteBody, body)
  console.log("backing up", conceptUri)
  return saveBackup(backup)
}

function createBackupInterval(ref, conceptUri, saveBackup, interval) {
  return setInterval(async () => {
    if (ref.current && (ref.current.conceptUri === conceptUri)) {
      await createBackup(conceptUri, saveBackup, ref.current.body)
    }
  }, interval)
}

function useBackup(name, intervalName){
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace('private')
  const backupsPath = workspace && getUrl(workspace, US.backupsStorage)
  const encodedName = name && conceptNameToUrlSafeId(name)
  const uri = backupsPath && encodedName && `${backupsPath}${encodedName}/${intervalName}.ttl#${backupThing}`
  const {thing: backup, ...rest} = useThing(uri)
  return { uri, backup, ...rest }

}

export function useIntervalBackups(name) {
  const webId = useWebId()
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace('private')
  const { uri: minuteUri, backup: oneMinuteBackup, save: saveMinute } = useBackup(name, 'minute')
//  const { uri: fiveMinutesUri, backup: fiveMinuteBackup, save: saveFiveMinutes } = useBackup(name, 'fiveminute')
//  const { uri: tenMinutesUri, backup: tenMinuteBackup, save: saveTenMinutes } = useBackup(name, 'tenminute')
//  const { uri: thirtyMinutesUri, backup: thirtyMinuteBackup, save: saveThirtyMinutes } = useBackup(name, 'thirtyminute')

  const { conceptUri, concept } = useConcept(webId, workspaceSlug, name)
  const noteStorageUri = concept && getUrl(concept, US.storedAt)
  const { thing: note } = useThing(noteStorageUri)
  const bodyRef = useRef()
  const bodyJSON = note && getStringNoLocale(note, US.noteBody)
  bodyRef.current = {conceptUri, body: bodyJSON}

  useEffect(() => {
    if (conceptUri && saveMinute /*&& saveFiveMinutes && saveTenMinutes && saveThirtyMinutes */){
      const one = createBackupInterval(bodyRef, conceptUri, saveMinute, EVERY_MINUTE)
//      const five = createBackupInterval(bodyRef, conceptUri, saveFiveMinutes, EVERY_FIVE_MINUTES)
//      const ten = createBackupInterval(bodyRef, conceptUri, saveTenMinutes, EVERY_TEN_MINUTES)
//      const thirty = createBackupInterval(bodyRef, conceptUri, saveThirtyMinutes, EVERY_THIRTY_MINUTES)
      return () => {
        clearInterval(one)
//        clearInterval(five)
//        clearInterval(ten)
//        clearInterval(thirty)
      }
    }
  }, [conceptUri, minuteUri /*, fiveMinutesUri, tenMinutesUri, thirtyMinutesUri*/])
  return { oneMinuteBackup /*, fiveMinuteBackup, tenMinuteBackup, thirtyMinuteBackup */}
}

export function useBackups(name) {
  const { backup: oneMinuteBackup } = useBackup(name, 'minute')
//  const { backup: fiveMinuteBackup } = useBackup(name, 'fiveminute')
//  const { backup: tenMinuteBackup } = useBackup(name, 'tenminute')
//  const { backup: thirtyMinuteBackup } = useBackup(name, 'thirtyminute')
  return { oneMinuteBackup /*, fiveMinuteBackup, tenMinuteBackup, thirtyMinuteBackup*/ }
}
