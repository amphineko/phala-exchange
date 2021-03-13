import { Button, CircularProgress, Grid, Snackbar } from '@material-ui/core'
import EjectIcon from '@material-ui/icons/Eject'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import { Alert } from '@material-ui/lab'
import React, { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'

import { Web3State } from '../providers/web3'


export interface Provider {
    close: () => void
}

export default function Account(props: {
    connect: () => void
    currentState: Web3State
    disconnect: () => void
    web3: Web3 | null
}): JSX.Element {
    const { connect, currentState: state, disconnect, web3 } = props

    const [account, setAccount] = useState<string | null>(null)
    const [balance, setBalance] = useState<string | null>(null)

    useEffect(() => {
        if (web3 === null) {
            setAccount(null)
            setBalance(null)
            return
        }

        web3.eth.getAccounts().then((accounts) => {
            if (accounts.length === 0) {
                throw new Error('No accounts connected')
            }

            setAccount(accounts[0]!)
        }).catch((reason) => {
            console.error(`Failed to read accounts: ${reason}`)
            // TODO: better UI presentation of account retrieve failure

            setAccount(null)
            throw reason
        })
    }, [web3])

    useEffect(() => {
        if (web3 === null || account === null) { return }

        web3.eth.getBalance(account).then((balance) => {
            setBalance(`${parseInt(balance) / 1000000000000000000}`)
        }, (reason) => {
            console.error(`Failed to retrieve account balance: ${reason}`)
            // TODO: better UI presentation of balance retrieve failure

            setBalance(`FAILED`)
            throw reason
        })
    })

    const button = useMemo(() => {
        switch (state) {
            case 'connected':
                return (<Button
                    color='secondary'
                    onClick={disconnect}
                    startIcon={<EjectIcon />}
                    variant='contained'
                >Disconnect</Button>)
            case 'disconnected':
                return (<Button
                    color='primary'
                    onClick={connect}
                    startIcon={<LockOpenIcon />}
                    variant='contained'
                >Connect</Button >)
            case 'connecting':
            case 'disconnecting':
                return (<Button disabled startIcon={<CircularProgress />}>Connecting</Button>)
        }
    }, [state])

    const accountInfo = useMemo(() => account !== null ? (
        <Alert severity='success'>Account: {account}</Alert>
    ) : null, [account, balance])

    return (
        <Grid container>
            <Grid item>{button}</Grid>
            <Grid item>{accountInfo}</Grid>
        </Grid>
    )
}
