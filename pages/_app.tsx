import { Box, Container, CssBaseline, Paper, Tab, Tabs } from '@material-ui/core'
import { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Context from '../contexts/Web3Context'
import { useWeb3 } from '../providers/web3'
import WalletWidget from '../widgets/Wallet'

function useWeb3Accounts(web3: Web3 | null): {
    accounts: string[] | null
    currentAccount: string | null
    setCurrentAccount: (account: string) => void
} {
    const [accounts, setAccounts] = useState<string[] | null>(null)
    const [account, setCurrentAccount] = useState<string | null>(null)

    useEffect(() => {
        if (web3 === null) {
            setAccounts(null)
            return
        }

        web3.eth.getAccounts().then((accounts) => {
            if (accounts instanceof Array) {
                setAccounts(accounts)
                setCurrentAccount(accounts[0] ?? null) // TODO: remember last selection
            } else {
                console.log(accounts)
                throw new Error('getAccounts() returned non-array')
            }
        }, (reason) => {
            setAccounts([])
            console.error(`Failed to retrieve accounts: ${reason as string}`)
            // TODO: display account retrieve failure on UI
        })
    }, [web3])

    return {
        accounts,
        currentAccount: account,
        setCurrentAccount
    }
}

export default function Application({ Component, pageProps }: AppProps): JSX.Element {
    const {
        connect: connectWeb3,
        disconnect: disconnectWeb3,
        provider: web3provider,
        state: web3state
    } = useWeb3({ network: 'test' })

    const web3 = useMemo(() => {
        return web3provider === null ? null : new Web3(web3provider as any)
    }, [web3provider])

    const {
        accounts: availableAccounts,
        currentAccount: account,
        setCurrentAccount: setAccount
    } = useWeb3Accounts(web3)

    const router = useRouter()

    const currentTabIndex = ({
        '/burn': 0,
        '/claim': 1
    })[router.pathname] ?? undefined

    return (
        <Web3Context.Provider value={{ account, web3 }}>
            <CssBaseline />
            <Container maxWidth="sm">
                <Paper elevation={4}>
                    <Box component="header" style={{ padding: '1rem', paddingBottom: 0 }}>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>tPHA exchange</h1>
                        <WalletWidget
                            availableAccounts={availableAccounts}
                            connect={connectWeb3}
                            currentAccount={account}
                            currentState={web3state}
                            disconnect={disconnectWeb3}
                            setAccount={setAccount}
                        />
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
