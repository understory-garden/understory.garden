import { useState, useEffect } from 'react'
import { useWebId } from 'swrlit'
import {
  getBoolean, setBoolean, getThingAll,
  thingAsMarkdown, getUrl, setThing, asUrl,
  getStringNoLocale
} from '@inrupt/solid-client'

import Nav from '../components/nav'
import WebMonetization from '../components/WebMonetization'
import { US } from '../vocab'
import { useAppSettings } from '../hooks/app'
import { useConceptPrefix, useConcept } from '../hooks/concepts'
import { conceptUriToName } from '../utils/uris'
import { useGnomesResource } from '../hooks/gnomes'
import { newSinglePageGateThing, updateSinglePageGateThing } from '../model/gnomes'
import NewNoteForm from '../components/NewNoteForm'

function SettingToggle({ settings, predicate, onChange, label, description }) {
  const [value, setValue] = useState()
  const currentValue = getBoolean(settings, predicate)
  useEffect(() => {
    currentValue && setValue(currentValue)
  }, [currentValue])
  function toggle() {
    const newValue = !value
    setValue(newValue)
    onChange && onChange(setBoolean(settings, predicate, newValue))
  }
  return (
    <div className="">
      <span>
        <span className="text-sm font-medium text-gray-900">
          {label}
        </span>
        <span className="text-sm text-gray-500">
          {description}
        </span>
      </span>

      <button type="button"
        onClick={toggle}
        className={`${value ? "bg-indigo-600" : "bg-gray-200"} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        aria-pressed="false" aria-labelledby="availability-label">
        <span className="sr-only">Use setting</span>

        <span aria-hidden="true" className={`${value ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
      </button>
    </div>
  )
}

function SectionHeader({ title, description }) {
  return (
    <div className="mt-6">
      <h2 className="text-3xl font-large text-gray-900 mb-3">
        {title}
      </h2>
      <p className="text-sm text-gray-500">
        {description}
      </p>
    </div>
  )
}

function GnomeThingEntry({ thing }) {
  const type = thing && getStringNoLocale(thing, US.hasGnomeType)
  const template = thing && getStringNoLocale(thing, US.usesGateTemplate)
  const conceptPrefix = thing && getStringNoLocale(thing, US.conceptPrefix)
  const conceptUrl = thing && getUrl(thing, US.usesConcept)
  const conceptName = conceptUrl && conceptUriToName(conceptUrl)
  return (
    <div>
      <h5 className="font-bold">{type}</h5>
        deployed using the
      <h5 className="font-bold">{template}</h5>
        template and
      <h5 className="font-bold">{conceptName}</h5>
    </div>
  )
}

function GnomeThingEditor({ webId, thing, updateThing, cancelAdd}) {
  // Users are currently able to edit the following Gate Config values (we only support Gate type gnomes for now)
  // Concept picker / new note picker to set concept for single-page-gate
  //    onSubmit returns concept name
  //    hooks/concepts useConcept(webId, workspace, name) to turn that name into an id.
  // hooks/app useConceptPrefix to get the prefix
  const isNewThing = !thing
  const currentConceptName = thing && conceptUriToName(getUrl(thing, US.usesConcept))
  const [chosenConceptName, setChoseConceptName] = useState(currentConceptName)
  const [editingNoteName, setEditingNoteName] = useState(!thing)
  const [editingGate, setEditingGate] = useState(!thing)

  const conceptPrefix = useConceptPrefix(webId, 'default')
  const { concept } = useConcept(webId, 'default', chosenConceptName)

  function setEditingAll(b) {
    setEditingNoteName(b)
    setEditingGate(b)
  }
  function onSubmit(selectedNoteName) {
    setChoseConceptName(selectedNoteName)
    setEditingNoteName(false)
  }
  async function onSave() {
    if (isNewThing) {
      const newThing = newSinglePageGateThing(webId, conceptPrefix, concept)
      await updateThing(newThing)
    } else {
      await updateThing(updateSinglePageGateThing(thing, concept))
    }
    setEditingGate(false)
  }
  function cancelEdit() {
    setEditingGate(false)
    cancelAdd && cancelAdd()
  }
  return (
    <div className="mb-6">
      { editingGate ? (
        <>
          <h3 className="mb-3">What note would you like to use for your Gate?</h3>
          <div className="w-full">
            {editingNoteName ? (
              <NewNoteForm onSubmit={onSubmit} initialSelectedName={chosenConceptName} submitTitle="choose" />
            ) : (
              <div className="flex justify-between">
                <h5 className="font-bold">{chosenConceptName}</h5>
                <button className="btn" onClick={() => setEditingAll(true)}>Pick a different note</button>
              </div>
            )}
          </div>
          <div className="flex">
            <button className="btn mt-3" disabled={!chosenConceptName} onClick={onSave}>Save and Deploy Gate</button>
            <button className="btn" onClick={cancelEdit}>Cancel</button>
          </div>
        </>
      ) : (
        <div className="flex justify-between mt-3">
          <GnomeThingEntry thing={thing} />
          <button className="btn" onClick={() => setEditingAll(true)}>Edit Gate</button>
        </div>
      )}
    </div>
  )
}

function GnomesResourceEditor({ webId }) {
  const { resource, save } = useGnomesResource(webId)
  const [addingNewGnome, setAddingNewGnome] = useState(false)
  const gnomeThings = resource && getThingAll(resource)
  async function updateThing(newThing) {
    const newResource = setThing(resource, newThing)
    await save(newResource)
    setAddingNewGnome(false)
  }
  function cancel() {
    setAddingNewGnome(false)
  }
  return (
    <div className="mt-3">
      { gnomeThings && gnomeThings.map((thing, i) => (
        <GnomeThingEditor key={i}
          webId={webId}
          thing={thing}
          updateThing={updateThing}/>
      ))}
      { addingNewGnome ?
        (<GnomeThingEditor webId={webId} updateThing={updateThing} cancelAdd={cancel} />) :
        (<button className="btn" onClick={() => setAddingNewGnome(true)}>Create a New Gate</button>)
      }
    </div>
  )
}

export default function Profile() {
  const webId = useWebId()
  const { settings, save } = useAppSettings(webId)
  function onChange(newSettings) {
    save(newSettings)
  }
  return (
    <div className="page">
      <WebMonetization webId={webId} />
      <Nav />
      <h1 className="text-5xl text-center mb-12">Settings</h1>
      <div className="mx-36">
        {settings && (
          <SettingToggle settings={settings} predicate={US.devMode} onChange={onChange}
            label="Developer Mode"
            description="Seatbelts off, maximum information."
          />
        )}
        <SectionHeader title="Gates"
          description={(<>
            Gates are customizable websites that serve as gateways to your garden.
            Right now we only support deploying a single note to a simple one page website,
            but expect richer templates soon. Custom domains are availible to paid members
            only. Reach out at <a href="mailto:hello@understory.coop">hello@understory.coop</a> to purchase a plan.
            </>)} />
        <GnomesResourceEditor webId={webId} />
        <SectionHeader title="Zines"
          description={(<>
            Zines are rich, interactive html newsletters sent to your subscribers.
            Zines are availible to paid members only.
            Reach out at <a href="mailto:hello@understory.coop">hello@understory.coop</a> to purchase a plan.
          </>)} />
      </div>
    </div>
  )
}
