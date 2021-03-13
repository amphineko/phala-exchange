import { Container, Paper, Tab, Tabs } from '@material-ui/core'
import { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import Web3 from 'web3'

import { useWeb3 } from '../providers/web3'
import Account from '../widgets/Account'

import '../styles/app.css'

export default function Application({ Component, pageProps }: AppProps): JSX.Element {
    const {
        connect: connectWeb3, disconnect: disconnectWeb3, provider: web3provider, state: web3state
    } = useWeb3({ network: 'test' })
    const web3 = useMemo(() => {
        return web3provider === null ? null : new Web3(web3provider as any)
    }, [web3provider])

    return (
        <Container>
            <Account connect={connectWeb3} currentState={web3state} disconnect={disconnectWeb3} web3={web3} />
            <Paper>
                <Tabs>
                    {/* TODO: highlight current tab */}
                    <Link href="/burn"><Tab label="Burn" /></Link>
                    <Link href="/claim"><Tab label="Claim" /></Link>
                </Tabs>
                <Component {...pageProps} />
            </Paper>
        </Container>
    )
}
