import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

import { useVersion } from './hooks/useVersion'
import { useMainContext } from './context/MainContext'

export const API_VERSION_COOKIE_NAME = 'apiVersionPreferred'

// This component allows us to set the URL Param for the REST API Calendar Date version
// We set a cookie as well to remember what calendar date version the user is on
export function RestRedirect() {
  const router = useRouter()
  const { currentVersion } = useVersion()
  const { allVersions } = useMainContext()
  const apiVersions = allVersions[currentVersion].apiVersions
  const latestApiVersion = allVersions[currentVersion].latestApiVersion

  useEffect(() => {
    if (allVersions[currentVersion].apiVersions.length > 0 && !router.query.apiVersion) {
      const versionCookie = Cookies.get(API_VERSION_COOKIE_NAME)
      const date =
        versionCookie && apiVersions.includes(versionCookie) ? versionCookie : latestApiVersion
      const hash = router.asPath.split('#')[1]
      const [asPathRoot, asPathQuery = ''] = router.asPath.split('#')[0].split('?')
      const params = new URLSearchParams(asPathQuery)

      params.set('apiVersion', date)
      const url = `/${router.locale}${asPathRoot}?${params}${hash ? '#' + hash : ''}`
      router.replace(url)
    }
  }, [router.asPath, currentVersion])
  return null
}
