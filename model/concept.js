export function conceptNameFromUri(uri){
  return uri.substring(uri.lastIndexOf('/') + 1, uri.lastIndexOf('.'))
}
