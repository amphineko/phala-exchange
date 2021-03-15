import { Button, CircularProgress, Container, Link, TextField, Typography } from '@material-ui/core'
import MonetizationOn from '@material-ui/icons/MonetizationOn'
import { Alert } from '@material-ui/lab'
import React, { useContext, useMemo, useState } from 'react'
import Web3Context from '../contexts/Web3Context'
import { load as loadContract } from '../lib/phalaTokenContract'

const burnToAddress = '0x000000000000000000000000000000000000dead'
const burnAmountHelperText = 'NOTE: The maximum amount to exchange is limited to 0.1 to avoid accidental asset loss. Ask in our Discord if you want to exchange more.'
const defaultAmount = 0.1

interface RecentTransaction {
    etherscanBaseUrl: string
    hash: string
}

export default function BurnPage(): JSX.Element {
    const { account, web3 } = useContext(Web3Context)

    // amount input by user and validations

    const [amount, setAmount] = useState<Number | null>(defaultAmount)
    const [amountError, setAmountError] = useState<string | null>(null)

    const onAmountChange = (input: string): void => {
        const value = Number(input)
        setAmount(null)

        if (isNaN(value)) {
            setAmountError('Amount to burn is not a number')
            return
        }
        if (value <= 0 || value > 0.1) {
            setAmountError('Amount to burn is out of range')
            return
        }

        setAmount(value)
        setAmountError(null)
    }

    // recent transactions

    const [lastTxnError, setLastTxnError] = useState<string | null>(null)
    const [lastTxn, setLastTxn] = useState<RecentTransaction | null>(null)
    const lastTxnInspectUrl = useMemo(
        () => lastTxn !== null
            ? `${lastTxn.etherscanBaseUrl}/tx/${lastTxn.hash}`
            : null
        , [lastTxn])

    // active transtion in progress

    const [active, setActive] = useState<boolean>(false)

    // error preventing the exchange to proceed

    const error = useMemo<string | null>(() => {
        if (web3 === null) return 'Ethereum wallet is not connected'
        if (account === null) return 'No Ethereum account selected'

        return null
    }, [account, web3])

    // allow user to proceed or not

    const enabled = useMemo<boolean>(
        () => web3 !== null && account !== null && amount !== null && !active,
        [web3, account, amount, active]
    )

    // burn logic

    const burn = async (): Promise<void> => {
        if (active || web3 === null || account === null || amount === null) return

        setLastTxn(null)

        const { consts, contract } = await loadContract(web3)
        const wei = web3.utils.toWei(amount.toString())

        console.log(`Sending ${amount.toString()} PHA (${wei} wei)`)

        const receipt = await contract.methods
            .transfer(burnToAddress, wei)
            .send({ from: account })

        setLastTxn({
            etherscanBaseUrl: consts.etherscanBaseUrl,
            hash: receipt.transactionHash
        })
    }

    const onClickBurn = (): void => {
        setActive(true)
        burn().then(() => { }, (error) => {
            setLastTxnError(error.message ?? error)
        }).finally(() => {
            setActive(false)
        })
    }

    return (
        <Container>
            <TextField
                defaultValue={defaultAmount}
                error={amountError !== null}
                fullWidth
                helperText={amountError === null ? burnAmountHelperText : amountError}
                label="Amount"
                onChange={(ev) => onAmountChange(ev.target.value)}
                required
            />
            <Button
                disabled={!enabled}
                onClick={onClickBurn}
                startIcon={!active ? <MonetizationOn /> : <CircularProgress />}
                style={{ marginTop: '1rem' }}
                variant="contained"
            >Exchange</Button>
            {error === null || (
                <Alert severity="error" style={{ marginTop: '1rem' }}>
                    <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                        {error}
                    </span>
                </Alert>
            )}
            {lastTxnError !== null && (
                <Alert severity="error" style={{ marginTop: '1rem' }}>
                    <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                        Transaction failed: {lastTxnError}
                    </span>
                </Alert>
            )}
            {lastTxn !== null && (
                <Alert severity="success" style={{ marginTop: '1rem' }}>
                    <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                        Transaction sent: <Link href={lastTxnInspectUrl ?? '#'} rel="noreferrer" target="_blank">{lastTxn.hash}</Link>
                    </span>
                </Alert>
            )}
            <Typography
                color='textSecondary'
                hidden={!(!active || lastTxn === null)}
                style={{ marginTop: '1rem' }}
                variant="body2">
                Please sit back and relax while the transaction is being sent and accepted by the network.
            </Typography>
        </Container >
    )
}
