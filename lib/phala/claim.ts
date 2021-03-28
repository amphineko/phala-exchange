import { EcdsaSignature } from '@phala-network/typedefs'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { DispatchError, Hash } from '@polkadot/types/interfaces'
import { hexToU8a, u8aToHex } from '@polkadot/util'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import Web3 from 'web3'
import { Brand } from '../brand'
import { NetworkDescription } from './network'
import { Types as PhalaTypes } from './typedefs'

export type Signature = Brand<string>

/**
 * @param claimer Account address of claimer on Phala
 * @param tx Burn transaction on Ethereum
 * @param account Account address who burned the tokens on Ethereum
 */
export async function createClaimSignature(claimer: Uint8Array, tx: Uint8Array, account: string, web3: Web3): Promise<EcdsaSignature> {
    const message = `${u8aToHex(claimer)}${u8aToHex(tx)}`
    console.log(`Signing message "${message}"`)
    const signature = await web3.eth.personal.sign(message, account, '')
    return hexToU8a(signature, 65 * 8) as EcdsaSignature
}

/**
 * @param claimer Address of account who claim the PHA tokens on Phala netowork
 * @param tx Hash of transaction that burns the Ethereum PHA tokens
 * @param sign Signature to confirm receipt address on Phala network
 * @param network Network description of Phala network connect to
 */
export async function sendClaimTransaction(
    claimer: Uint8Array, tx: Uint8Array, sign: EcdsaSignature, network: NetworkDescription
): Promise<Hash> {
    const provider = new WsProvider(network.websocketEndpoint)
    const api = await ApiPromise.create({ provider, types: PhalaTypes })
    await cryptoWaitReady()

    const extrinsic = api.tx.phaClaim.claimErc20Token(claimer, tx, sign)
    const promise = new Promise<Hash>((resolve, reject) => {
        // TODO: pass nonce to signAndSend
        extrinsic.send((result) => {
            console.log(`Extrinsic status: ${result.status.toString()}`)

            // TODO: use status.isInBlock while nonce is available
            if (result.status.isFinalized) {
                const failure = result.events.filter((e) => {
                    // https://polkadot.js.org/docs/api/examples/promise/system-events
                    return api.events.system.ExtrinsicFailed.is(e.event)
                })[0]

                if (failure !== undefined) {
                    const { event: { data: [error] } } = failure
                    if ((error as DispatchError)?.isModule?.valueOf()) {
                        // https://polkadot.js.org/docs/api/cookbook/tx#how-do-i-get-the-decoded-enum-for-an-extrinsicfailed-event
                        const decoded = api.registry.findMetaError((error as DispatchError).asModule)
                        const { documentation, method, section } = decoded

                        reject(new Error(`Extrinsic failed: ${section}.${method}: ${documentation.join(' ')}`))
                    } else {
                        reject(new Error(`Extrinsic failed: ${error?.toString() ?? (error as unknown as string)} `))
                    }
                }

                resolve(result.status.hash)
            }

            if (result.status.isInvalid) {
                reject(new Error('Invalid transaction'))
            }
        }).then((unsubscribe) => {
            // comment out the following may help resolving weird error leaking
            promise.finally(() => unsubscribe())
        }).catch((reason) => {
            console.error(reason)
            reject(new Error(`Failed to send extrinsic: ${(reason as Error)?.message ?? reason} `))
        })

        console.log('Extrinsic sent')
    })

    return await promise
}
