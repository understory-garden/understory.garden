import { getDatetime } from "@itme/solid-client";
import { dct } from "rdf-namespaces"

export const byDatetime = (term) => (a, b) => getDatetime(a, term) - getDatetime(b, term)


export const byDctModified = byDatetime(dct.modified)
