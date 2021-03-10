import { GeistProvider, Page } from '@geist-ui/react'
import { useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import { WalletConnection, Provider } from './web3/connect'

import { geistTheme } from './config'
import './app.css'
import styles from './app.module.css'

export function Application(): JSX.Element {
    const [provider, setProvider] = useState<Provider | null>(null)

    // const web3 = useMemo(() => new Web3(provider as any), [provider])

    return (
        <GeistProvider themes={[geistTheme]} themeType='appDark'>
            <Page.Header className={styles.container}>
                <WalletConnection
                    currentProvider={provider}
                    network={'test'}
                    setProvider={(provider) => setProvider(provider)}
                />
            </Page.Header>
            <Page.Content>
                <Switch>
                    <Route exact path="/">
                    </Route>
                </Switch>
            </Page.Content>
        </GeistProvider>
    )
}
