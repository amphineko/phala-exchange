import { CssBaseline, GeistProvider, Page, Spacer, Tabs, Text } from '@geist-ui/react'
import { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Context from '../contexts/Web3Context'
import { useWeb3 } from '../providers/web3'
import { theme } from '../styles/theme'
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
    } = useWeb3({ network: process?.env?.NETWORK ?? 'poc4' })

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
        '/burn': 'burn',
        '/claim': 'claim'
    })[router.pathname.toLowerCase()] ?? undefined

    useEffect(() => {
        router.prefetch('/burn').catch(() => { })
        router.prefetch('/claim').catch(() => { })

        if (currentTabIndex === undefined && typeof window !== 'undefined') {
            // eslint-disable-next-line no-void
            void router.push('/burn')
        }
    })

    return (
        <Web3Context.Provider value={{ account, web3 }}>
            <GeistProvider themes={[theme]} themeType="Custom">
                <CssBaseline />
                <Page size="mini">
                    <Page.Header>
                        <Text h1 size="1.2rem" style={{ paddingTop: '4rem' }}>tPHA exchange</Text>
                        <Text>
                            <Link href='https://phala.network/'>Home</Link>
                            <Spacer inline x={1} />
                            <Link href='https://t.me/phalanetwork'>Telegram</Link>
                            <Spacer inline x={1} />
                            <Link href='https://discord.com/invite/zjdJ7d844d'>Discord</Link>
                        </Text>
                        <WalletWidget
                            availableAccounts={availableAccounts}
                            connect={connectWeb3}
                            currentAccount={account}
                            currentState={web3state}
                            disconnect={disconnectWeb3}
                            setAccount={setAccount}
                        />
                    </Page.Header>

                    <Page.Content>
                        <Tabs onChange={(value) => { router.push(value).catch(() => { }) }} value={currentTabIndex}>
                            <Link href="/burn">
                                <Tabs.Item label="Burn" value="burn" />
                            </Link>
                            <Link href="/claim">
                                <Tabs.Item label="Claim" value="claim" />
                            </Link>
                        </Tabs>
                        <Component {...pageProps} />
                    </Page.Content>
                </Page>
            </GeistProvider>
        </Web3Context.Provider>
    )
}
