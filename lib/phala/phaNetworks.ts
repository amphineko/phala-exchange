export interface NetworkDescription {
    websocketEndpoint: string
}

export const Networks: Record<string, NetworkDescription> = {
    main: {
        // phalaBase: 'https://poc3.phala.network',
        websocketEndpoint: 'wss://poc3.phala.network/ws'
    },
    test: {
        // phalaBase: 'https://poc3.phala.network',
        websocketEndpoint: 'wss://poc3.phala.network/ws'
    },
    localhost: {
        // phalaBase: 'https://poc3.phala.network',
        websocketEndpoint: 'ws:////localhost:9944'
    }
}
