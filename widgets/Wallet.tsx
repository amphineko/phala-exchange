import { Box, Button, CircularProgress } from '@material-ui/core'
import EjectIcon from '@material-ui/icons/Eject'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import { Alert } from '@material-ui/lab'
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
                return (<Button
                    color='secondary'
                    onClick={disconnect}
                    startIcon={<EjectIcon />}
                    variant='contained'
                >Disconnect Wallet</Button>)
            case 'disconnected':
                return (<Button
                    color='primary'
                    onClick={connect}
                    startIcon={<LockOpenIcon />}
                    variant='contained'
                >Connect Wallet</Button >)
            case 'connecting':
            case 'disconnecting':
                return (<Button disabled startIcon={<CircularProgress />}>Connecting</Button>)
        }
    }, [connect, disconnect, state])

    const accountInfo = useMemo(() =>
        state === 'connected'
            ? (account !== null
                ? (<Alert severity='success'>Account: {account}</Alert>)
                : (<Alert severity='error'>No account available</Alert>)
            )
            : null, [account, state])

    return (
        <Box>
            <Box display="block">{button}</Box>
            {state === 'connected' &&
                <Box display="block" style={{ marginTop: '1rem' }}>{accountInfo}</Box>}
        </Box>
    )
}
