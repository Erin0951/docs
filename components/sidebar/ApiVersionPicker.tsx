import { useRouter } from 'next/router'
import cx from 'classnames'
import Cookies from 'js-cookie'

import { useMainContext } from 'components/context/MainContext'
import { DEFAULT_VERSION, useVersion } from 'components/hooks/useVersion'
import { Picker } from 'components/ui/Picker'
import { useTranslation } from 'components/hooks/useTranslation'
import { API_VERSION_COOKIE_NAME } from 'components/RestRedirect'

import styles from './SidebarProduct.module.scss'

const API_VERSION_SUFFIX = ' (latest)'

type Props = {
  variant?: 'inline'
  width?: number
}

function rememberApiVersion(apiVersion: string) {
  try {
    // We use this cookie to remember which API Version a user chooses
    // when they navigate the REST docs.
    const apiVersionNormalized = apiVersion.replace(API_VERSION_SUFFIX, '')
    Cookies.set(API_VERSION_COOKIE_NAME, apiVersionNormalized, {
      expires: 365,
      secure: document.location.protocol !== 'http:',
    })
  } catch (err) {
    // You can never be too careful because setting a cookie
    // can fail. For example, some browser
    // extensions disallow all setting of cookies and attempts
    // at the `document.cookie` setter could throw. Just swallow
    // and move on.
    console.warn('Unable to set preferred api version cookie', err)
  }
}

export const ApiVersionPicker = ({ variant, width }: Props) => {
  const router = useRouter()
  const { currentVersion } = useVersion()
  const { allVersions } = useMainContext()
  const { t } = useTranslation(['products'])
  const basePath = router.asPath.split('#')[0].split('?')[0]
  // Get current date from cookie, query path, or lastly set it to latest rest version date
  const currentDate =
    router.query.apiVersion && typeof router.query.apiVersion === 'string'
      ? router.query.apiVersion
      : allVersions[currentVersion].latestApiVersion

  const currentDateDisplayText =
    currentDate === allVersions[currentVersion].latestApiVersion
      ? currentDate + API_VERSION_SUFFIX
      : currentDate

  const apiVersionLinks = allVersions[currentVersion].apiVersions.map((date) => {
    const itemLink = `/${router.locale}${basePath}?apiVersion=${date}`
    const dateDisplayText =
      date === allVersions[currentVersion].latestApiVersion ? date + API_VERSION_SUFFIX : date

    return {
      text: dateDisplayText,
      selected: router.query.apiVersion === date,
      href: itemLink,
      info: false,
      onselect: rememberApiVersion,
    }
  })

  apiVersionLinks.push({
    text: t('rest.versioning.about_versions'),
    selected: false,
    info: true,
    href: `/${router.locale}${
      currentVersion === DEFAULT_VERSION ? '' : `/${currentVersion}`
    }/rest/overview/api-versions`,
    onselect: rememberApiVersion,
  })

  // This only shows the REST Version picker if it's calendar date versioned
  return allVersions[currentVersion].apiVersions.length > 0 ? (
    <div
      className={
        variant === 'inline'
          ? 'border-top my-2 pt-2'
          : cx(
              'pt-4 px-4 d-flex flex-justify-center pb-4 border-bottom',
              styles.apiVersionPicker,
              styles.apiFixedHeader
            )
      }
      style={{ width: `${width}px` }}
    >
      <div data-testid="api-version-picker" className="width-full">
        <Picker
          variant={variant}
          apiVersion={true}
          defaultText={currentDateDisplayText}
          options={apiVersionLinks}
        />
      </div>
    </div>
  ) : (
    <div className={cx(styles.noApiVersion)}></div>
  )
}
