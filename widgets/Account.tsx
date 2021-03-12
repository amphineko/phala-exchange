import { Button, Grid, Note } from '@geist-ui/react'
import * as Icons from '@geist-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'

import { useWeb3 } from '../providers/web3'

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

export default function Account(props: {
    network: string
}): JSX.Element {
    const { connect: connectWeb3, disconnect: disconnectWeb3, provider } = useWeb3({ network: 'test' })

    const web3 = useMemo(() => {
        return provider !== null ? new Web3(provider as any) : null
    }, [provider])

    const [account, setAccount] = useState<string | null>(null)

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
                ? <Button auto ghost icon={<Icons.LogIn />} type="secondary" onClick={() => connectWeb3()}>Connect</Button>
                : <Connected address={account ?? 'UNKNOWN'} onDisconnectClicked={() => disconnectWeb3()} />
            }
        </div>
    )
}
