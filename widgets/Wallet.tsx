import { Button, Grid, Note } from '@geist-ui/react'
import { Key, XCircle } from '@geist-ui/react-icons'
import React, { useMemo } from 'react'
import { Web3State } from '../providers/web3'

export interface Provider {
    close: () => void
}

export default function WalletWidget(props: {
    connect: () => void
    disconnect: () => void
    setAccount: (account: string) => void

    currentState: Web3State

    availableAccounts: string[] | null
    currentAccount: string | null
}): JSX.Element {
    // TODO: implement account selector

    const {
        // availableAccounts: accounts,
        connect,
        currentAccount: account,
        currentState: state,
        disconnect
    } = props

    const button = useMemo(() => {
        switch (state) {
            case 'connected':
                return (
                    <Button
                        auto
                        icon={<XCircle />}
                        onClick={disconnect}
                        type="secondary"
                    >Disconnect Wallet</Button>
                )
            case 'disconnected':
                return (
                    <Button
                        auto
                        icon={<Key />}
                        onClick={connect}
                        type="secondary"
                    >Connect Wallet</Button>
                )
            case 'connecting':
            case 'disconnecting':
                return (
                    <Button disabled loading={true}>Connecting</Button>
                )
        }
    }, [connect, disconnect, state])

    const accountInfo = useMemo(() =>
        state === 'connected'
            ? (account !== null
                ? (<Note label="Account" type="secondary">{account}</Note>)
                : (<Note type="error">No account available</Note>)
            )
            : null, [account, state])

    return (
        <Grid.Container direction="column" gap={1}>
            <Grid>{button}</Grid>
            <Grid>
                {state === 'connected' && accountInfo}
            </Grid>
        </Grid.Container>
    )
}
