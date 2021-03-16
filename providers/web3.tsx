import { useMemo, useRef, useState } from 'react'
import Web3Modal from 'web3modal'

interface Provider {
    close?: () => void
}

export type Web3State = 'connected' | 'connecting' | 'disconnected' | 'disconnecting'

interface Web3Wrapper {
    connect: () => Promise<Provider>
    disconnect: () => Promise<void>
    provider: Provider | null
    state: Web3State
}

function useBrowserWeb3(options: {
    network: 'test'
}): Web3Wrapper {
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

    const connect = async (): Promise<Provider> => {
        setState('connecting')

        try {
            const provider = await web3Modal.connect()
            setProvider(provider)

            setState('connected')
            return provider
        } catch (error) {
            setState('disconnected')
            throw error
        }
    }

    const disconnect = async (): Promise<void> => {
        setState('disconnecting')

        try {
            if (typeof provider?.close === 'function') {
                const ret = provider.close() as unknown
                if (ret instanceof Promise) { await ret }
            }
            setProvider(null)
            web3Modal.clearCachedProvider()

            setState('disconnected')
            return await Promise.resolve()
        } catch (error) {
            setState('disconnected')
            throw error
        }
    }

    return {
        connect: async () => await (connecting.current = connecting.current ??
            connect().finally(() => { connecting.current = null })
        ),
        disconnect: async () => await (disconnecting.current = disconnecting.current ??
            disconnect().finally(() => { disconnecting.current = null })
        ),
        provider,
        state
    }
}

function useDummyWeb3(): Web3Wrapper {
    return {
        connect: async (): Promise<Provider> => { throw new Error('SSR in use') },
        disconnect: async (): Promise<void> => { throw new Error('SSR in use') },
        provider: null,
        state: 'disconnected' as Web3State

    }
}

export const useWeb3 = typeof window === 'undefined' ? useDummyWeb3 : useBrowserWeb3
