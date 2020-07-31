import { getDatetimeOne } from "@itme/solid-client";
import { dct } from "rdf-namespaces"

export const byDatetime = (term) => (a, b) => getDatetimeOne(a, term) - getDatetimeOne(b, term)


export const byDctModified = byDatetime(dct.modified)
