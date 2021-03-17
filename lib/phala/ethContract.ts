import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import ABI from './ethTokenABI'

interface EthereumConst {
    etherscanBaseUrl: string
    tokenAddress: string
}

export const EthereumConsts: Record<number, EthereumConst> = {
    1: {
        // Ethereum Mainnet
        etherscanBaseUrl: 'https://etherscan.io',
        tokenAddress: '0x6c5bA91642F10282b576d91922Ae6448C9d52f4E'
    },
    42: {
        // Ethereum Testnet Kovan
        etherscanBaseUrl: 'https://kovan.etherscan.io',
        tokenAddress: '0x512f7a3c14b6ee86c2015bc8ac1fe97e657f75f2'
    }
}

export async function load(web3: Web3): Promise<{ consts: EthereumConst, contract: Contract }> {
    const chainId = await web3.eth.getChainId()
    console.log(`Loading Phala contract for chain ${chainId}`)

    const consts = EthereumConsts[chainId] ?? null
    if (consts === null) {
        throw new Error(`Chain with Id ${chainId} is not supported`)
    }

    return {
        consts,
        contract: new web3.eth.Contract(ABI, consts.tokenAddress)
    }
}
