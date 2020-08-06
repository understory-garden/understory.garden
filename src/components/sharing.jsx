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
import { Button, Avatar, Loader } from '~components/elements'
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
      return createAclFromFallbackAcl(datasetWithAcl);
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
    <div className="flex flex-row">
      <ReadIcon className={permClasses(p.read)} />
      <WriteIcon className={permClasses(p.write)} />
      <AppendIcon className={permClasses(p.append)} />
      <ControlIcon className={permClasses(p.control)} />
    </div>
  )
}

const makeEditPerm = (IconComponent, perm) => ({ permissions: p, setPermission }) => (
  <div className="grid grid-cols-6 mx-6">
    <IconComponent className={`col-span-1 ${permClasses(p[perm])}`} />
    <h4 className="col-span-3 flex-grow">{perm}</h4>
    <Button className="col-span-2" onClick={() => setPermission(perm, !p[perm])}>
      {p[perm] ? "Revoke" : "Grant"}
    </Button>
  </div>
)


const EditRead = makeEditPerm(ReadIcon, 'read')
const EditWrite = makeEditPerm(WriteIcon, 'write')
const EditAppend = makeEditPerm(AppendIcon, 'append')
const EditControl = makeEditPerm(ControlIcon, 'control')


function PermissionEditor({ agentUri, permissions, resource, mutate, onDone }) {
  async function setPermission(key, value) {
    console.log("setting permissions on resource: ", agentUri)
    const resourceAcl = getOrCreateResourceAcl(resource)
    const updatedAcl = setAgentResourceAccess(
      resourceAcl,
      agentUri,
      { ...permissions, [key]: value }
    )
    const savedAclDataset = await saveAclFor(resource, updatedAcl)
    console.log(savedAclDataset)
    // TODO figure out why this doesn't like to be passed savedAclDataset
    mutate(/*savedAclDataset*/);
  }
  return (
    <div>
      <div className="flex flex-col">
        <EditRead setPermission={setPermission} permissions={permissions} />
        <EditWrite setPermission={setPermission} permissions={permissions} />
        <EditAppend setPermission={setPermission} permissions={permissions} />
        <EditControl setPermission={setPermission} permissions={permissions} />
      </div>
      <Button onClick={onDone}>Ok</Button>
    </div>
  )
}



const defaultPerms = { read: false, write: false, append: false, control: false }

export function FileSharing({ file }) {
  const [creatingAgent, setCreatingAgent] = useState()
  const [editing, setEditing] = useState()
  const { file: fileWithAcl, mutate } = useFile(asUrl(file), { acl: true })
  const publicAccess = fileWithAcl && getPublicAccess(fileWithAcl)
  const accessByAgent = fileWithAcl && getAgentAccessAll(fileWithAcl);
  const editingPermissions = editing && ((editing === "public") ? publicAccess : accessByAgent[editing])
  return (
    <div className="absolute inset-0 z-40 bg-white bg-opacity-75 flex flex-col overflow-y-scroll">
      {fileWithAcl ? (
        editing ? (
          <PermissionEditor agentUri={editing} permissions={editingPermissions} resource={fileWithAcl} mutate={mutate} onDone={() => setEditing(null)} />
        ) : (
            <>
              {publicAccess && (
                <div className="my-3 flex flex-row justify-evenly itens-center">
                  <h1>everybody</h1>
                  {publicAccess && <PermIcons permissions={publicAccess} />}
                  <Button onClick={() => setEditing("public")}>Edit</Button>
                </div >
              )}
              {accessByAgent && (Object.entries(accessByAgent).map(([agentUri, permissions]) => (
                <div key={agentUri} className="my-3 flex flex-row justify-evenly items-center">
                  <Avatar webId={agentUri} />
                  <PermIcons permissions={permissions} />
                  <Button onClick={() => setEditing(agentUri)}>Edit</Button>
                </div >
              )))
              }
              {
                creatingAgent && (
                  <div className="my-3 flex flex-row justify-evenly items-center">
                    <h1>{creatingAgent}</h1>
                    <PermissionEditor agentUri={creatingAgent} permissions={defaultPerms} resource={fileWithAcl} />
                  </div>
                )
              }
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
            </>
          )
      ) : (
          <Loader />
        )
      }
    </div >
  )
}
