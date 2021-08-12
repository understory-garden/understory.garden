import { useState, useEffect } from 'react'
import { useWebId } from 'swrlit'
import {
  getBoolean, setBoolean, getThingAll,
  getUrl, setThing, getThing,
  asUrl, getStringNoLocale, getSourceUrl
} from '@inrupt/solid-client'
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { FG, trackGoal } from '../model/fathom';

import Nav from '../components/nav'
import WebMonetization from '../components/WebMonetization'
import { US } from '../vocab'
import { useAppSettings, useDevMode } from '../hooks/app'
import { useConcept } from '../hooks/concepts'
import { conceptUriToName, understoryGardenConceptPrefix } from '../utils/uris'
import { useGnomesResource } from '../hooks/gnomes'
import { newSinglePageGateThing, updateSinglePageGateThing, setupGnome, updateDeploymentStatus } from '../model/gnomes'
import NotePicker from '../components/NotePicker'
import { Loader, InlineLoader } from '../components/elements'
import { deleteResource } from '../utils/fetch';

const SinglePageGateSchema = Yup.object().shape({
  css: Yup.string()
});

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
    <div className="flex flex-row justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">
          {label}
        </div>
        <div className="text-sm text-gray-500">
          {description}
        </div>
      </div>

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
      <p className="">
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
  const deployedAt = thing && getUrl(thing, US.deployedAt)
  return (
    <div>
      <h5 className="font-bold">{type}</h5>
        deployed using the
      <h5 className="font-bold">{template}</h5>
        template and
      <h5 className="font-bold">{conceptName}</h5>
        to
      {deployedAt ? (
        <h5 className="font-bold">
          <a href={deployedAt} target='_blank' rel='noopener noreferrer'>{deployedAt}</a>
        </h5>
      ) : (
        <InlineLoader/>
      )}
    </div>
  )
}

function GnomeThingEditor({ webId, thing, updateThing, cancelAdd }) {
  // Users are currently able to edit the following Gate Config values (we only support Gate type gnomes for now)
  // Concept picker / new note picker to set concept for single-page-gate
  //    onSubmit returns concept name
  //    hooks/concepts useConcept(webId, workspace, name) to turn that name into an id.
  // hooks/app useConceptPrefix to get the prefix
  const isNewThing = !thing
  const currentConceptName = thing && conceptUriToName(getUrl(thing, US.usesConcept))
  const [chosenConceptName, setChosenConceptName] = useState(currentConceptName)
  const [editingNoteName, setEditingNoteName] = useState(!thing)
  const [editingGate, setEditingGate] = useState(!thing)
  const [savingGate, setSavingGate] = useState(false)

  const conceptPrefix = understoryGardenConceptPrefix(webId, 'default')
  const { concept, index } = useConcept(webId, 'default', chosenConceptName)

  async function save({ css }) {
    try {
      setSavingGate(true)
      if (isNewThing) {
        const newThing = newSinglePageGateThing(webId, conceptPrefix, index, concept, css)
        await updateThing(newThing)
        trackGoal(FG.gateCreated)
      } else {
        await updateThing(updateSinglePageGateThing(thing, webId, conceptPrefix, index, concept, css))
        trackGoal(FG.gateEdited)
      }
    } finally {
      setEditingGate(false)
      setSavingGate(false)
    }
  }

  function cancelEdit() {
    setEditingGate(false)
    cancelAdd && cancelAdd()
  }

  const currentCSS = thing && getStringNoLocale(thing, US.usesCSS)
  return (
    <div className="mb-12">
      { savingGate ? (
        <Loader />
      ) : (
        editingGate ? (
          <Formik
            initialValues={{
              conceptName: chosenConceptName,
              css: currentCSS || ''
            }}
            validationSchema={SinglePageGateSchema}
            onSubmit={save}
          >
            {({ errors, touched, setFieldValue, values: { conceptName } }) => (

              <Form>
                <div className="flex flex-col">
                  <div>
                    <h3 className="mb-3">What note would you like to use for your Gate?</h3>

                    {editingNoteName ? (
                      <NotePicker onSubmit={(newConceptName) => {
                        setFieldValue('conceptName', newConceptName)
                        // we need to set this here so that the concept loader above will
                        // load the concept
                        setChosenConceptName(newConceptName)
                        setEditingNoteName(false)
                      }}
                        initialSelectedName={conceptName}/>
                    ) : (
                      <div className="flex justify-between">
                        <h5 className="font-bold">{conceptName}</h5>
                        <button className="btn" onClick={() => setEditingNoteName(true)}>Pick a different note</button>
                      </div>
                    )}
                  </div>
                  <Field id="css" name="css"
                    as="textarea"
                    className="my-3"
                    placeholder="add custom css" />
                  {errors.css && touched.css ? <div className="text-red-500">{errors.css}</div> : null}

                  <div className="flex mt-1">
                    <button className="btn" disabled={!conceptName} type="submit">Save and Deploy Gate</button>
                    <button className="btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="flex justify-between mt-3">
            <GnomeThingEntry thing={thing} />
            <button className="btn" onClick={() => setEditingGate(true)}>Edit Gate</button>
          </div>
        ))
      }
    </div >
  )
}

function GnomesResourceEditor({ webId }) {
  const devMode = useDevMode(webId)
  const { resource, save } = useGnomesResource(webId)
  const [addingNewGnome, setAddingNewGnome] = useState(false)
  const gnomeThings = resource && getThingAll(resource)
  async function updateThing(newThing) {
    setAddingNewGnome(false)
    const newResource = setThing(resource, newThing)
    const updatedResource = await save(newResource)
    console.log("updated resource", updatedResource)
    const resourceUrl = getSourceUrl(updatedResource)
    const thingUrl = asUrl(newThing, resourceUrl)
    console.log(`Requesting setup for gnome at url: ${thingUrl}`)
    const gnomeConfig = await setupGnome({ url: thingUrl })
    console.log("gnome is set up")
    let deployedThing = getThing(updatedResource, thingUrl)
    console.log("got deployed thing")
    deployedThing = updateDeploymentStatus(deployedThing, gnomeConfig)
    console.log("updated deployed thing")
    const deployedResource = setThing(updatedResource, deployedThing)
    console.log(`Saving deployment info to gnome at url: ${thingUrl}`)
    await save(deployedResource)
    console.log(`Finished setting up gnome at url: ${thingUrl}`)
  }
  function cancel() {
    setAddingNewGnome(false)
  }
  return (
    <div className="mt-3">
      {devMode && (
        <button className="btn" onClick={() => { deleteResource(getSourceUrl(resource)) }}>
          Delete Gnomes Resource
        </button>
      )}
      { gnomeThings && gnomeThings.map((thing, i) => (
        <GnomeThingEditor key={i}
          webId={webId}
          thing={thing}
          updateThing={updateThing} />
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
        <SectionHeader title="Gates"
          description={(<>
            Gates are customizable websites that serve as gateways to your garden.
            Right now we only support deploying a single note to a simple one page website,
            but expect richer templates soon. Custom domains are available to paid members
            only. Reach out at <a href="mailto:hello@understory.coop">hello@understory.coop</a> to purchase a plan.
            </>)} />

        <GnomesResourceEditor webId={webId} />
        <SectionHeader title="Zines"
          description={(<>
            Zines are rich, interactive html newsletters sent to your subscribers.
            Zines are available to paid members only.
            Reach out at <a href="mailto:hello@understory.coop">hello@understory.coop</a> to purchase a plan.
          </>)} />

        <SectionHeader title="Miscellaneous"
          description="" />
        {settings && (
          <SettingToggle settings={settings} predicate={US.devMode} onChange={onChange}
            label="Developer Mode"
            description="Seatbelts off, maximum information."
          />
        )}
      </div>
    </div>
  )
}
