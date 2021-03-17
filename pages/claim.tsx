import { Box, Button, CircularProgress, Container, Link, TextField } from '@material-ui/core'
import { MonetizationOn } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'
import React, { useContext, useMemo, useState } from 'react'
import Web3Context from '../contexts/Web3Context'
import { createClaimSignature, sendClaimTransaction, Signature } from '../lib/phala/phaClaim'
import { Networks } from '../lib/phala/phaNetworks'

function useClaimer(): [string | null, string | null, (input: string) => void] {
    const [claimer, setClaimer] = useState<string | null>(null)
    const [claimerError, setClaimerError] = useState<string | null>(null)

    return [
        claimer,
        claimerError,
        (input: string): void => {
            if (input.length === 0) {
                setClaimer(null)
                setClaimerError(null)
                return
            }

            try {
                decodeAddress(input) // verify by attempting to decode
                setClaimer(input)
                setClaimerError(null)
            } catch (error) {
                // decodeAddress should throw when invalid
                const s = error instanceof Error ? error.message : toString.call(error)
                setClaimer(null)
                setClaimerError(s)
            }
        }
    ]
}

function useEthTxHash(): [string | null, string | null, (input: string) => void] {
    const [txHash, setTxHash] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const regex = /^0x[A-Fa-f0-9]{64}$/

    return [
        txHash, error, (input: string) => {
            setTxHash(null)
            setError(null)

            if (input.length === 0) { return }

            if (regex.test(input)) {
                setTxHash(input)
            } else {
                setError('Malformed transaction hash')
            }
        }
    ]
}

const claimerHelperText = 'Account who receive the tokens on the Phala network'
const txHashHelperText = 'Transaction hash of burned Ethereum PHA tokens'

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

        let sign: Signature
        try {
            sign = await createClaimSignature(claimer, txHash, account, web3)
        } catch (error) {
            throw new Error(`Signing failed: ${(error as Error)?.message ?? error}`)
        }

        try {
            await sendClaimTransaction(claimer, txHash, sign, network, (error, hash) => {
                if (error !== null) {
                    setClaimError(`Extrinsic failed: ${error.message ?? error}`)
                    return
                }

                const hashHex = u8aToHex(hash)
                setClaimTx({ hash: hashHex, url: network.inspectTxUrl(hashHex) })
            })
        } catch (error) {
            throw new Error(`Send Tx failed: ${(error as Error)?.message ?? error} `)
        }
    }

    const startClaim = (): void => {
        try {
            setClaiming(true)
            setClaimError(null)
            claim().catch((error) => {
                console.log(error)
                setClaimError((claimError as unknown as Error)?.message ?? claimError)
            })
        } finally {
            setClaiming(false)
        }
    }

    // presentation widgets

    const precondition = useMemo(() => {
        if (web3 === null) { return 'Ethereum wallet is not connected' }
        if (account === null) { return 'No Ethereum account is available' }

        return null
    }, [account, web3])

    const preconditionWidget = useMemo(() => precondition === null || (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                {`${precondition}`}
            </span>
        </Alert>
    ), [precondition])

    const claimErrorWidget = useMemo(() => claimError === null || (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                {`${claimError}`}
            </span>
        </Alert>
    ), [claimError])

    const claimTxWidget = useMemo(() => claimTx === null || (
        <Alert severity="success" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                Claimed! <Link href={claimTx.url}>{claimTx.hash}</Link>
            </span>
        </Alert>
    ), [claimTx])

    return (
        <Container>
            <Alert severity='warning'>This feature is currently under development</Alert>
            {preconditionWidget}
            {claimErrorWidget}
            {claimTxWidget}
            <TextField
                autoFocus
                error={claimerError !== null}
                fullWidth
                helperText={claimerError ?? claimerHelperText}
                label="Recipient address"
                onChange={(ev) => onClaimerChange(ev?.target?.value)}
                placeholder="SS58-formatted Phala address"
                style={{ marginTop: '1rem' }}
            />
            <TextField
                autoFocus
                error={txHashError !== null}
                fullWidth
                helperText={txHashError ?? txHashHelperText}
                label="Ethereum transaction"
                onChange={(ev) => onTxHashChange(ev.target.value)}
                placeholder="0x000000000000000000000000000000000000dead"
                style={{ marginTop: '1rem' }}
            />
            <Box>
                <Button
                    disabled={!isFormValid || isClaiming}
                    onClick={() => startClaim()}
                    startIcon={isClaiming ? <CircularProgress /> : <MonetizationOn />}
                    style={{ display: 'inline-block', marginTop: '1rem' }}
                    variant="contained"
                >Exchange</Button>
            </Box>
        </Container>
    )
}
