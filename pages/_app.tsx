import { Box, Container, CssBaseline, Paper, Tab, Tabs } from '@material-ui/core'
import { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import Web3 from 'web3'
import Web3Context from '../contexts/Web3Context'
import { useWeb3 } from '../providers/web3'
import Account from '../widgets/Account'

export default function Application({ Component, pageProps }: AppProps): JSX.Element {
    const {
        connect: connectWeb3, disconnect: disconnectWeb3, provider: web3provider, state: web3state
    } = useWeb3({ network: 'test' })
    const web3 = useMemo(() => {
        return web3provider === null ? null : new Web3(web3provider as any)
    }, [web3provider])

    const router = useRouter()

    const currentTabIndex = ({
        '/burn': 0,
        '/claim': 1
    })[router.pathname] ?? undefined

    return (
        <Web3Context.Provider value={web3}>
            <CssBaseline />
            <Container maxWidth="sm">
                <Paper elevation={4}>
                    <Box component="header" style={{ padding: '1rem', paddingBottom: 0 }}>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>tPHA exchange</h1>
                        <Account connect={connectWeb3} currentState={web3state} disconnect={disconnectWeb3} web3={web3} />
                    </Box>
                    <Box>
                        <Tabs value={currentTabIndex}>
                            {/* TODO: highlight current tab */}
                            <Link href="/burn"><Tab label="Burn" /></Link>
                            <Link href="/claim"><Tab label="Claim" /></Link>
                        </Tabs>
                    </Box>
                    <Box style={{ paddingBottom: '1rem', paddingTop: '1rem' }}>
                        <Component {...pageProps} />
                    </Box>
                </Paper>
            </Container>
        </Web3Context.Provider>
    )
}
