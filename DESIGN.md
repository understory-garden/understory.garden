# encodeURIComponent

GET https://itme.online/u/travis/concepts/Understory%20A%20Digital%20Gardening%20Platform%20For%20The%20Future

## find "Understory A Digital Gardening Platform For The Future"

GET https://travis.itme.online/public/itme/concepts.ttl#Understory%20A%20Digital%20Gardening%20Platform%20For%20The%20Future

c:Understory%20A%20Digital%20Gardening%20Platform%20For%20The%20Future storageLocation https://travis.itme.online/public/itme/concepts/Understory.ttl
c:understory sameAs c:Understory%20A%20Digital%20Gardening%20Platform%20For%20The%20Future


# slugification

GET https://itme.online/u/travis/understory-foo-bar

## find "understory-foo-bar"

GET https://travis.itme.online/public/itme/concepts.ttl#understory-foo-bar

c:Understory storageLocation https://travis.itme.online/public/itme/concepts/understory-foo-bar.ttl
             title "Understory"



# create concept index

createConceptReferencesFor(conceptUri, concepts)

tvconcepts = https://travis.itme.online/public/itme/concepts.ttl#
tvconcepts:Understory fb:refs tvconcepts:Travis

newConceptReferences = setDatetime(newConceptReferences, DCTERMS.modified, new Date())

tvconcepts:Understory dcterms:modified 2021-02-10:12:00:00
