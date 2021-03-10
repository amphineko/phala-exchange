import { Button, Grid, Note } from '@geist-ui/react'
import * as Icons from '@geist-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Modal from 'web3modal'

export interface Provider {
    close: () => void
}

export function Connected(props: {
    address: string
    onDisconnectClicked: () => void
}): JSX.Element {
    const { address, onDisconnectClicked } = props

    return (
        <Grid.Container>
            <Grid xs>
                <Button auto ghost icon={<Icons.LogOut />} type="secondary" onClick={() => onDisconnectClicked()}>Disconnect</Button>
            </Grid>
            <Grid xl>
                <Note filled label={'account'}>{address}</Note>
            </Grid>
        </Grid.Container>
    )
}

export function WalletConnection(props: {
    currentProvider: Provider | null
    network: string
    setProvider: (provider: Provider | null) => void
}): JSX.Element {
    const { currentProvider: provider, network, setProvider } = props

    const web3Modal = useMemo(() => new Web3Modal({
        cacheProvider: true,
        network,
        providerOptions: {}
    }), [network])

    const web3 = useMemo(() => {
        return provider !== null ? new Web3(provider as any) : null
    }, [provider])

    const [account, setAccount] = useState<string | null>(null)

    const connect = (): void => {
        web3Modal.connect().then((provider) => {
            setProvider(provider)
        }).catch((reason) => {
            setProvider(null)
            console.error(`Failed to connect web3: ${reason as string}`)
            // TODO: present error on UI
        })
    }

    const disconnect = (): void => {
        web3Modal.clearCachedProvider()

        if (typeof provider?.close === 'function') {
            provider.close()
        }
        setProvider(null)
    }

    useEffect(() => {
        if (web3 !== null) {
            web3.eth.getAccounts().then((accounts) => {
                setAccount(accounts[0] ?? 'UNKNOWN')
                // TODO: handle `undefined` account
            }).catch((reason) => {
                console.error(`Failed to retrieve accounts: ${reason as string}`)
                // TODO: present error on UI
            })
        } else {
            setAccount(null)
        }
    }, [web3])

    return (
        <div>
            {provider === null
                ? <Button auto ghost icon={<Icons.LogIn />} type="secondary" onClick={() => connect()}>Connect</Button>
                : <Connected address={account ?? 'UNKNOWN'} onDisconnectClicked={() => disconnect()} />
            }
        </div>
    )
}
