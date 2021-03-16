import { ApiPromise, WsProvider } from '@polkadot/api'
import { DispatchError, Hash } from '@polkadot/types/interfaces'
import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'
import Web3 from 'web3'
import { Brand } from '../brand'
import { NetworkDescription } from './phaNetworks'
import { Types as PhalaTypes } from './phaTypes'

type Signature = Brand<string>

export async function createClaimSignature(phaClaimer: string, ethTxnHash: string, ethAccount: string, web3: Web3): Promise<Signature> {
    try {
        // normalize and validate (by polkadot) the address of claimer
        phaClaimer = u8aToHex(decodeAddress(phaClaimer))
    } catch (reason) {
        console.error(`Malformed claimer address (${phaClaimer}): ${reason as string}`)
        throw new Error('Malformed claimer address')
    }

    const hash = ethTxnHash.match(/^0x([A-Fa-f0-9]{64})$/)?.[1]
    if (hash === undefined) {
        throw new Error('Malformed transaction hash')
    }

    return await web3.eth.personal.sign(`0x${phaClaimer}${hash}`, ethAccount, '') as Signature
}

/**
 * @param account Address of account who claim the PHA tokens on Phala netowork
 * @param ethTxnHash Hash of transaction that burns the Ethereum PHA tokens
 * @param ethSign Signature to confirm receipt address on Phala network
 * @param network Network description of Phala network connect to
 */
export async function sendClaimTransaction(account: string, ethTxnHash: string, ethSign: Signature, network: NetworkDescription): Promise<Promise<Hash>> {
    const provider = new WsProvider(network.websocketEndpoint)
    const api = await ApiPromise.create({ provider, types: PhalaTypes })

    const claimTxn = api.tx.phaClaim.claimErc20Token(account, ethTxnHash, ethSign)

    return await new Promise((resolve, reject) => {
        const [resolveSend, rejectSend] = [resolve, reject]

        const extrinsic = new Promise<Hash>((resolve) => {
            claimTxn.send(({ events, status }) => {
                if (!status.isFinalized && !status.isInBlock) {
                    if (status.isInvalid) {
                        throw new Error('Invalid transaction')
                    }

                    // TODO: remove this
                    console.error(events)
                    console.error(status)
                    throw new Error('Unknown error')
                }

                events
                    .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
                    .forEach(({ event: { data: [error, info] } }) => {
                        // https://polkadot.js.org/docs/api/cookbook/tx#how-do-i-get-the-decoded-enum-for-an-extrinsicfailed-event

                        if ((error as DispatchError)?.isModule?.valueOf()) {
                            const decoded = api.registry.findMetaError((error as DispatchError).asModule)
                            const { documentation, method, section } = decoded

                            throw new Error(`ExtrinsicFailed: ${section}.${method}: ${documentation.join(' ')}`)
                        } else {
                            throw new Error(`ExtrinsicFailed: ${error?.toString() ?? (error as unknown as string)}`)
                        }
                    })

                resolve(status.hash)
            }).then(() => resolveSend(extrinsic), (reason) => rejectSend(reason))
        })
    })
}
