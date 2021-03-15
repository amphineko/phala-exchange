import React from 'react'
import Web3 from 'web3'

interface Web3Context {
    account: string | null
    web3: Web3 | null
}

export default React.createContext<Web3Context>({ account: null, web3: null })
