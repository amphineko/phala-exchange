import { Button, Grid, Input, Link, Note, Text } from '@geist-ui/react'
import { Send } from '@geist-ui/react-icons'
import { EcdsaSignature, EthereumTxHash } from '@phala-network/typedefs'
import { AccountId } from '@polkadot/types/interfaces'
import { decodeAddress } from '@polkadot/util-crypto'
import { isLeft, isRight } from 'fp-ts/lib/These'
import React, { ReactNode, useContext, useMemo, useState } from 'react'
import Web3Context from '../contexts/Web3Context'
import { ethereumTxHash } from '../lib/ethereum/io'
import { createClaimSignature, sendClaimTransaction } from '../lib/phala/claim'
import { Networks } from '../lib/phala/network'

function useClaimer(): [AccountId | null, string | null, (input: string) => void] {
    const [claimer, setClaimer] = useState<AccountId | null>(null)
    const [claimerError, setClaimerError] = useState<string | null>(null)

    return [claimer, claimerError, (input: string): void => {
        try {
            // verify by attempting to decode
            setClaimer(decodeAddress(input) as AccountId)
            setClaimerError(null)
        } catch (error) {
            // decodeAddress should throw when invalid
            setClaimer(null)
            setClaimerError((error as Error)?.message ?? toString.call(error))
        }
    }]
}

function useEthTxHash(): [EthereumTxHash | null, string | null, (input: string) => void] {
    const [error, setError] = useState<string | null>(null)
    const [txHash, setTxHash] = useState<EthereumTxHash | null>(null)

    return [txHash, error, (input: string) => {
        const decoded = ethereumTxHash.decode(input)
        setError(isLeft(decoded) ? 'Invalid transaction hash' : null)
        setTxHash(isRight(decoded) ? ethereumTxHash.encode(decoded.right) : null)
    }]
}

// const claimerHelperText = 'Account who receive the tokens on the Phala network'
// const txHashHelperText = 'Transaction hash of burned Ethereum PHA tokens'

const ErrorWidget = (props: { children: ReactNode }): JSX.Element => {
    return (
        <Note label="Error" type="error">
            <Text span>
                {props.children}
            </Text>
        </Note>
    )
}

export default function ClaimPage(): JSX.Element {
    const { account, web3 } = useContext(Web3Context)

    // form fields

    const [claimer, claimerError, onClaimerChange] = useClaimer()
    const [txHash, txHashError, onTxHashChange] = useEthTxHash()

    const isFormValid = useMemo(
        () => claimer !== null && claimerError === null && txHash !== null && txHashError === null
        , [claimer, claimerError, txHash, txHashError])

    // last claim transaction

    const [isClaiming, setClaiming] = useState<boolean>(false)
    const [claimError, setClaimError] = useState<string | null>(null)
    const [claimTx, setClaimTx] = useState<{ hash: string, url: string } | null>(null)

    const claim = async (): Promise<void> => {
        if (account === null || claimer === null || txHash === null || web3 === null) {
            return
        }

        setClaimTx(null)

        const network = Networks.test // TODO: add network selection
        if (network === undefined) { throw new Error('Assertion failed') }

        let sign: EcdsaSignature
        try {
            sign = await createClaimSignature(claimer, txHash, account, web3)
        } catch (error) {
            throw new Error(`Signing failed: ${(error as Error)?.message ?? error}`)
        }

        const hash = await sendClaimTransaction(claimer, txHash, sign, network)
        console.log('extrinsic sent')
        setClaimTx({ hash: hash.toHex(), url: network.inspectTxUrl(hash.toHex()) })
    }

    const startClaim = (): void => {
        setClaiming(true)
        setClaimError(null)
        claim().catch((error) => {
            setClaimError((error as unknown as Error)?.message ?? error)
        }).finally(() => {
            setClaiming(false)
        })
    }

    // presentation widgets

    const precondition = useMemo(() => {
        if (web3 === null) { return 'Ethereum wallet is not connected' }
        if (account === null) { return 'No Ethereum account is available' }

        return null
    }, [account, web3])

    const preconditionWidget = useMemo(() => precondition !== null && (
        <ErrorWidget>
            {`${precondition}`}
        </ErrorWidget>
    ), [precondition])

    const claimErrorWidget = useMemo(() => claimError !== null && (
        <ErrorWidget>
            {`${claimError}`}
        </ErrorWidget>
    ), [claimError])

    const claimTxWidget = useMemo(() => claimTx !== null && (
        <ErrorWidget>
            Claimed! <Link href={claimTx.url}>{claimTx.hash}</Link>
        </ErrorWidget>
    ), [claimTx])

    return (
        <Grid.Container direction="column" gap={1}>
            <Grid>
                {preconditionWidget}
                {claimErrorWidget}
                {claimTxWidget}
            </Grid>

            <Grid>
                <Input
                    autoFocus
                    label="Recipient"
                    onChange={(ev) => onClaimerChange(ev?.target?.value)}
                    placeholder="SS58-formatted Phala address"
                    status={claimerError === null ? 'secondary' : 'error'}
                    width="100%"
                />
            </Grid>

            <Grid>
                <Input
                    autoFocus
                    label="Ethereum transaction"
                    onChange={(ev) => onTxHashChange(ev.target.value)}
                    placeholder="0x"
                    status={txHashError === null ? 'secondary' : 'error'}
                    width="100%"
                />
            </Grid>

            <Grid>
                <Button
                    auto
                    disabled={!isFormValid || isClaiming}
                    icon={<Send />}
                    loading={isClaiming}
                    onClick={() => startClaim()}
                    type="secondary"
                >{isClaiming ? 'Sending' : 'Claim'}</Button>
            </Grid>
        </Grid.Container>
    )
}
