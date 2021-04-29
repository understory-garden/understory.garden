import { useState, useEffect } from 'react'
import { useWebId } from 'swrlit'
import {
  getBoolean, setBoolean, getThingAll, thingAsMarkdown
} from '@inrupt/solid-client'

import Nav from '../components/nav'
import WebMonetization from '../components/WebMonetization'
import { US } from '../vocab'
import { useAppSettings } from '../hooks/app'
import { useGnomesResource } from '../hooks/gnomes'
import NewNoteForm from '../components/NewNoteForm'

function SettingToggle({settings, predicate, onChange, label, description}){
  const [value, setValue] = useState()
  const currentValue = getBoolean(settings, predicate)
  useEffect(() => {
    currentValue && setValue(currentValue)
  }, [currentValue])
  function toggle(){
    const newValue = !value
    setValue(newValue)
    onChange && onChange(setBoolean(settings, predicate, newValue))
  }
  return (
    <div className="flex items-center justify-between">
      <span className="flex-grow flex flex-col" id="availability-label">
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

function SectionHeader({title, description}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex-grow flex flex-col" id="availability-label">
        <span className="text-lg font-large text-gray-900">
          {title}
        </span>
        <span className="text-sm text-gray-500">
          {description}
        </span>
      </span>
    </div>
  )
}

const GateGnomeType = "gate"
const SinglePageGateTemplateId = "single-page-gate"

function GnomeThingEntry({thing}) {
  return (
    <div>{thing && thingAsMarkdown(thing)}</div>
  )
}

function GnomeThingEditor({thing, updateThing}) {
  // Users are currently able to edit the following Gate Config values (we only support Gate type gnomes for now)
  // Concept picker / new note picker to set concept for single-page-gate
  //    onSubmit returns concept name
  //    hooks/concepts useConcept(webId, workspace, name) to turn that name into an id.
  // hooks/app useConceptPrefix to get the prefix
  // assume defualt workspace
  const [chosenConcept, setChoseConcept] = useState()
  const [editing, setEditing] = useState(!thing)
  // const useConcept(webId, 'default', noteName)

  async function onSubmit(selectedNoteName) {
    setConceptName(selectedNoteName)
  }
  return (
    <div className="flex items-center justify-between">
      { editing ? (
        <>
          What note would you like to use for your Gate?
          <NewNoteForm onSubmit={onSubmit} submitTitle="choose"/>
        </>
        ) : (
        <>
          <GnomeThingEntry thing={thing}/>
          <button className="btn">Edit Gate</button>
        </>
      )}
    </div>
  )
}

function GnomesResourceEditor({webId}) {
  const { resource, save } = useGnomesResource(webId)
  const [addingNewGnome, setAddingNewGnome] = useState(false)
  const gnomeThings = resource && getThingAll(resource)
  async function updateThing(newThing) {
    // updateResource with setThing
    // await save(resource)
    // do something
  }
  async function addThing(newThing) {
    setAddingNewGnome(false)
    updateThing(newThing)
  }
  return (
    <div className="flex items-center justify-between">
      { gnomeThings && gnomeThings.map(thing => (
        <GnomeThingEditor thing={thing} updateThing={updateThing}/>
      ))}
      { addingNewGnome ?
          (<GnomeThingEditor updateThing={updateThing}/>) :
          (<button className="btn" onClick={() => setAddingNewGnome(true)}>Create a New Gate</button>)
      }
    </div>
  )
}

export default function Profile(){
  const webId = useWebId()
  const { settings, save } = useAppSettings(webId)
  function onChange(newSettings) {
    save(newSettings)
  }
  return (
    <div className="page">
      <WebMonetization webId={webId}/>
      <Nav />
      <h1 className="text-5xl text-center mb-12">Settings</h1>
      <div className="mx-36">
        {settings && (
          <SettingToggle settings={settings} predicate={US.devMode} onChange={onChange}
                         label="Developer Mode"
                         description="Seatbelts off, maximum information."
          />
        )}
        <SectionHeader title="Gates" description="Gates are customizable websites that serve as gateways to your garden. Right now we only support deploying a single note to a simple one page website, but expect richer templates soon. Custom domains are availible to paid members only. Reach out at hello@understory.coop to purchase a plan."/>
        <GnomesResourceEditor webId={webId}/>
        <SectionHeader title="Zines" description="Zines are rich, interactive html newsletters sent to your subscribers. Zines are availible to paid members only. Reach out at hello@understory.coop to purchase a plan."/>
      </div>
    </div>
  )
}
