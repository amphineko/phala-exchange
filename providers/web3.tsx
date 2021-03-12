import { useMemo, useRef, useState } from 'react'
import Web3Modal from 'web3modal'

interface Provider {
    close?: () => void
}

type Web3State = 'connected' | 'connecting' | 'disconnected' | 'disconnecting'

function useBrowserWeb3(options: {
    network: 'test'
}) {
    const { network } = options

    const [provider, setProvider] = useState<Provider | null>(null)
    const [state, setState] = useState<Web3State>('disconnected')

    const web3Modal = useMemo(() => new Web3Modal({
        cacheProvider: false,
        network,
        providerOptions: {}
    }), [network])

    const connecting = useRef<Promise<Provider> | null>(null)
    const disconnecting = useRef<Promise<void> | null>(null)

    const connect = async () => {
        setState('connecting')

        const provider = await web3Modal.connect()
        setProvider(provider)

        setState('connected')
        return provider
    }

    const disconnect = async () => {
        setState('disconnecting')

        if (typeof provider?.close === 'function') {
            const ret = provider.close() as unknown
            if (ret instanceof Promise)
                await ret
        }
        setProvider(null)
        web3Modal.clearCachedProvider()

        setState('disconnected')
        return Promise.resolve()
    }

    return {
        connect: () => connecting.current = connecting.current ??
            connect().finally(() => {
                connecting.current = null
            }),
        disconnect: () => disconnecting.current = disconnecting.current ??
            disconnect().finally(() => {
                disconnecting.current = null
            }),
        provider,
        state
    }
}

function useDummyWeb3() {
    return { connect: () => { }, disconnect: () => { }, provider: null, state: 'disconnected' }
}

export const useWeb3 = typeof window === 'undefined' ? useDummyWeb3 : useBrowserWeb3
