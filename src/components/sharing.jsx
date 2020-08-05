import { useState } from 'react'
import { Formik, Form } from 'formik';
import {
  asUrl, getPublicAccess, getAgentAccessAll,
  hasResourceAcl,
  hasFallbackAcl,
  hasAccessibleAcl,
  createAcl,
  createAclFromFallbackAcl,
  getResourceAcl,
  setAgentResourceAccess,
  saveAclFor,
} from '@itme/solid-client'

import { useFile } from "~hooks"
import { ReadIcon, WriteIcon, AppendIcon, ControlIcon } from '~components/icons'
import { Button } from '~components/elements'
import { TextField } from "~components/form"

function permissionsToString(p) {
  const permissions = [p.read && "read", p.write && "write", p.append && "append", p.control && "control"].filter(x => !!x)
  if (permissions.length > 1) {
    return `${permissions.slice(0, -1).join(", ")} and ${permissions.slice(-1)[0]}`
  } else {
    return permissions[0]
  }

}

const permClasses = permissions => {
  const color = permissions ? 'text-green-900' : 'text-red-700'
  return `${color} h-6 w-6`
}

function getOrCreateResourceAcl(datasetWithAcl, { initFromFallback = true } = {}) {
  if (!hasResourceAcl(datasetWithAcl)) {
    if (!hasAccessibleAcl(datasetWithAcl)) {
      throw new Error(
        "The current user does not have permission to change access rights to this Resource."
      );
    }
    if (initFromFallback) {
      if (!hasFallbackAcl(datasetWithAcl)) {
        throw new Error(
          "The current user does not have permission to see who currently has access to this Resource."
        );
      }
      console.log("initing from fallback", datasetWithAcl)
      debugger
      const r = createAclFromFallbackAcl(datasetWithAcl);
      console.log("R", r)
      return r
    } else {
      // Alternatively, initialise a new empty ACL as follows,
      // but be aware that if you do not give someone Control access,
      // **nobody will ever be able to change Access permissions in the future**:
      return createAcl(datasetWithAcl);
    }
  } else {
    return getResourceAcl(datasetWithAcl);
  }
}

function PermIcons({ permissions: p }) {
  return (
    <div className="flex flex-row">/
      <ReadIcon className={permClasses(p.read)} />
      <WriteIcon className={permClasses(p.write)} />
      <AppendIcon className={permClasses(p.append)} />
      <ControlIcon className={permClasses(p.control)} />
    </div>
  )
}

const makeEditPerm = (IconComponent, perm) => ({ permissions: p, setPermission }) => (
  <div className="flex flex-row">
    <IconComponent className={permClasses(p[perm])} />
    <Button onClick={() => setPermission(perm, !p[perm])}>
      {p[perm] ? "Revoke" : "Grant"}
    </Button>
  </div>
)


const EditRead = makeEditPerm(ReadIcon, 'read')
const EditWrite = makeEditPerm(ReadIcon, 'read')
const EditAppend = makeEditPerm(ReadIcon, 'read')
const EditControl = makeEditPerm(ReadIcon, 'read')


function EditPerms({ agentUri, resource, permissions }) {
  //  console.log("EDIT PERMS", resource)
  async function setPermission(key, value) {
    //    console.log("SET PERMS", resource)
    const resourceAcl = getOrCreateResourceAcl(resource)
    console.log("RA", resourceAcl)
    const updatedAcl = setAgentResourceAccess(
      resourceAcl,
      agentUri,
      { ...permissions, [key]: value }
    )
    console.log("RAU", updatedAcl)
    //await saveAclFor(resource, updatedAcl);

  }
  return (
    <div className="flex flex-col">
      <EditRead setPermission={setPermission} permissions={permissions} />
      <EditWrite setPermission={setPermission} permissions={permissions} />
      <EditAppend setPermission={setPermission} permissions={permissions} />
      <EditControl setPermission={setPermission} permissions={permissions} />
    </div>
  )
}

function EditablePerms({ agentUri, resource, permissions }) {
  const [editing, setEditing] = useState(false)
  //console.log("EDITABLE", resource)
  return editing ? (
    <>
      <EditPerms agentUri={agentUri} resource={resource} permissions={permissions} />
      <Button onClick={() => setEditing(false)}>Ok</Button>
    </>
  ) : (
      <div>
        <h1>{agentUri}</h1 >
        <PermIcons permissions={permissions} />
        <Button onClick={() => setEditing(true)}>Edit</Button>
      </div >
    )
}

const defaultPerms = { read: false, write: false, append: false, control: false }

export function FileSharing({ file }) {
  const [creatingAgent, setCreatingAgent] = useState()
  const { file: fileWithAcl } = useFile(asUrl(file), { acl: true })
  const publicAccess = fileWithAcl && getPublicAccess(fileWithAcl)
  const accessByAgent = fileWithAcl && getAgentAccessAll(fileWithAcl);
  //console.log("ACCESS", accessByAgent)
  //console.log("FILS SHARING", fileWithAcl)
  return (
    <div className="absolute inset-0 z-40 bg-white bg-opacity-75 flex flex-col">
      <div>
        <h1>everybody</h1>
        {publicAccess && <PermIcons permissions={publicAccess} />}
      </div>
      {creatingAgent && (
        <div>
          <h1>{creatingAgent}</h1>
          <EditablePerms agentUri={creatingAgent} resource={fileWithAcl} permissions={defaultPerms} />
        </div>
      )}
      <Formik
        initialValues={{ agentUri: "" }}
        onSubmit={async ({ agentUri }) => {
          setCreatingAgent(agentUri)
        }}
      >
        <Form>
          <div className="mb-4 text-align-center">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="agentUri">
              agent uri
            </label>
            <TextField className="w-full" name="agentUri" />
          </div>
          <Button type="submit">Add</Button>
        </Form>
      </Formik>

    </div>
  )
}
