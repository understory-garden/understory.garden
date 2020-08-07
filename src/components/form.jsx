import { Field } from 'formik';
import {
  setStringNoLocale, asUrl, getStringNoLocale, getThing
} from "@itme/solid-client";
import { rdfs } from "rdf-namespaces"

import { usePodsContainerUri } from "~hooks/uris"
import { useContainer, useMeta, useWebId } from "~hooks"

export function TextField({ className = '', ...rest }) {
  return (
    <Field type="text" className={`rounded opacity-75 leading-tite border-2 border-white focus:outline-none focus:border-purple-500 ${className}`} {...rest} />
  )
}

export function TextAreaField({ className = '', ...rest }) {
  return (
    <Field as="textarea" className={`rounded opacity-75 leading-tite border-2 border-white focus:outline-none focus:border-purple-500 ${className}`} {...rest} />
  )
}

function useMyPods(path) {
  const myWebId = useWebId()
  const publicPodsUri = usePodsContainerUri(myWebId, path)
  const { resources, ...rest } = useContainer(publicPodsUri)
  const { meta } = useMeta(publicPodsUri)
  return ({
    ...rest,
    pods: resources && resources.map(resource => {
      if (meta) {
        const url = asUrl(resource)
        const name = getStringNoLocale(getThing(meta, url), rdfs.label)
        return setStringNoLocale(resource, rdfs.label, name)
      } else {
        return resource
      }
    })
  })
}

export function PodPicker({ className = '', ...rest }) {
  const { pods: publicPods } = useMyPods("public")
  const { pods: privatePods } = useMyPods("private")
  const pods = [...(publicPods || []), ...(privatePods || [])]
  return (
    <Field component="select" className={`${className}`} {...rest}>
      <option>pick a pod</option>
      {pods.map(pod => (
        <option key={asUrl(pod)} value={asUrl(pod)}>{getStringNoLocale(pod, rdfs.label)}</option>
      ))}
    </Field>
  )

}
