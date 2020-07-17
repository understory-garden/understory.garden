export const otherPath = webId => {
  const webIdURL = new URL(webId);
  return `/u/${webIdURL.hostname}`
}
