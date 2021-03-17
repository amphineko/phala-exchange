import { Box, Button, CircularProgress, Container, TextField } from '@material-ui/core'
import { MonetizationOn } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { decodeAddress } from '@polkadot/util-crypto'
import React, { useContext, useMemo, useState } from 'react'
import Web3Context from '../contexts/Web3Context'

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

    const regex = /^0x([A-Fa-f0-9]{64})$/

    return [
        txHash, error, (input: string) => {
            if (input.length === 0) {
                setTxHash(null)
                setError(null)
                return
            }

            const match = regex.exec(input)?.[1] ?? null
            setTxHash(match)
            setError(match === null ? 'Malformed transaction hash' : null)
        }
    ]
}

const claimerHelperText = 'Account who receive the tokens on the Phala network'
const txHashHelperText = 'Transaction hash of burned Ethereum PHA tokens'

export default function ClaimPage(): JSX.Element {
    const { account, web3 } = useContext(Web3Context)

    const [claimer, claimerError, onClaimerChange] = useClaimer()
    const [txHash, txHashError, onTxHashChange] = useEthTxHash()

    const isFormValid = useMemo(
        () => claimer !== null && claimerError === null && txHash !== null && txHashError === null
        , [claimer, claimerError, txHash, txHashError])

    const [isClaiming, setClaiming] = useState<boolean>(false)
    // const [claimError, setClaimError] = useState<string | null>(false)
    // const [claimTx, setClaimTx] = useState<string | null>(false)

    const claim = async (): Promise<void> => {
        if (account === null || claimer === null || txHash === null || web3 === null) {
            return
        }

        // const network = Networks.test // TODO: add network selection
        // if (network === undefined) { throw new Error('Assertion failed') }

        // const sign = await createClaimSignature(claimer, txHash, ethAccount, web3)
        // await sendClaimTransaction(claimer, txHash, sign, network, (error, hash) => {
        //     // TODO: implement transaction callback
        // })
    }

    const startClaim = (): void => {
        try {
            setClaiming(true)
            claim().catch
        } finally {
            setClaiming(false)
        }
    }

    const precondition = useMemo(() => {
        if (web3 === null) { return 'Ethereum wallet is not connected' }
        if (account === null) { return 'No Ethereum account is available' }

        return null
    }, [account, web3])

    const preconditionWidget = useMemo(() => precondition === null || (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                {precondition}
            </span>
        </Alert>
    ), [precondition])

    return (
        <Container>
            <Alert severity='warning'>This feature is currently under development</Alert>
            {preconditionWidget}
            <TextField
                autoFocus
                error={claimerError !== null}
                fullWidth
                helperText={claimerError ?? claimerHelperText}
                label="Recipient address"
                onChange={(ev: { target: HTMLInputElement }) => onClaimerChange(ev?.target?.value)}
                placeholder="SS58-formatted Phala address"
                style={{ marginTop: '1rem' }}
            />
            <TextField
                autoFocus
                error={txHashError !== null}
                fullWidth
                helperText={txHashError ?? txHashHelperText}
                label="Ethereum transaction"
                onChange={(ev: { target: HTMLInputElement }) => onTxHashChange(ev.target.value)}
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
