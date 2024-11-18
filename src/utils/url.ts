export function urlJoin(base: string | URL, ...paths: ReadonlyArray<undefined | string>): URL {
  let url = new URL(base)

  for (const path of paths) {
    if (path === undefined) {
      continue
    }

    const nextBase = url.href.endsWith('/') ? url.href : `${url.href}/`
    const nextPath = path.startsWith('/') ? path.slice(1) : path

    url = new URL(nextPath, nextBase)
  }

  return url
}

export function urlEqual(url1: string | URL, url2: string | URL): boolean {
  if (typeof url1 === 'string') {
    return urlEqual(new URL(url1), url2)
  }

  if (typeof url2 === 'string') {
    return urlEqual(url1, new URL(url2))
  }

  // Compare protocol, hostname (case-insensitive), port, and pathname (case-sensitive)
  if (
    url1.protocol !== url2.protocol ||
    url1.hostname.toLowerCase() !== url2.hostname.toLowerCase() ||
    url1.port !== url2.port ||
    url1.pathname !== url2.pathname ||
    url1.hash !== url2.hash ||
    url1.username !== url2.username ||
    url1.password !== url2.password
  ) {
    return false
  }

  // Normalize and compare query parameters (ignoring order)
  const params1 = new URLSearchParams(url1.search)
  const params2 = new URLSearchParams(url2.search)

  // Sort query parameters for consistent comparison
  const sortedParams1 = Array.from(params1.entries()).sort()
  const sortedParams2 = Array.from(params2.entries()).sort()

  if (sortedParams1.length !== sortedParams2.length) {
    return false
  }

  for (let i = 0; i < sortedParams1.length; i++) {
    const [key1, value1] = sortedParams1[i]!
    const [key2, value2] = sortedParams2[i]!

    if (key1 !== key2 || value1 !== value2) {
      return false
    }
  }

  return true
}
