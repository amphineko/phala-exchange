import React, { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Modal from 'web3modal'

export function ConnectTab(props: {
    // onConnected: (provider: any) => void
}): JSX.Element {
    const web3Modal = useMemo(() => new Web3Modal({
        cacheProvider: true,
        network: 'test',
        providerOptions: {}
    }), [])

    const [accounts, setAccounts] = useState<string[] | null>(null)
    const [provider, setProvider] = useState<any | null>(null)

    useEffect(() => {
        const connectWeb3 = async (): Promise<void> => {
            const provider = await web3Modal.connect()
            setProvider(provider)
        }

        const readAccounts = async (): Promise<string[]> => {
            const web3 = new Web3(provider)
            const accounts = await web3.eth.getAccounts()
            setAccounts(accounts)
            return accounts
        }

        if (provider === null) {
            connectWeb3().then(() => {
                console.log('Connected to Eth provider')
            }, (reason) => {
                console.error(`Connecting to Eth provider failed: ${reason as string}`)
            })
        }

        if (provider !== null && accounts === null) {
            readAccounts().then((accounts) => {
                console.log(`Get accounts: ${accounts.join(', ')}`)
            }, (reason) => {
                console.error(`Failed to get accounts: ${reason as string}`)
            })
        }
    })

    return (<div />)
}
