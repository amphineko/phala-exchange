import { EthereumTxHash } from '@phala-network/typedefs'
import { hexToU8a } from '@polkadot/util'
import { either } from 'fp-ts/Either'
import { failure, string, success, Type } from 'io-ts'

const ethereumTxHashRegex = /^0x([A-Fa-f0-9]{64})$/

export const ethereumTxHash = new Type<string, EthereumTxHash>(
    'EthereumTxHash',
    string.is,
    (u, c) => either.chain(
        string.validate(u, c),
        (s) => ethereumTxHashRegex.test(s)
            ? success(s)
            : failure(s, c, 'Malformed Ethereum Tx hash')
    ),
    (a) => hexToU8a(a, 256) as EthereumTxHash
)
