import { getDatetimeOne } from "@solid/lit-pod";
import { dct } from "rdf-namespaces"

export const byDatetime = (term) => (a, b) => getDatetimeOne(a, term) - getDatetimeOne(b, term)


export const byDctModified = byDatetime(dct.modified)
