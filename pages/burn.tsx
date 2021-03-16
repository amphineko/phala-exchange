import { Button, CircularProgress, Container, Link, TextField, Typography } from '@material-ui/core'
import MonetizationOn from '@material-ui/icons/MonetizationOn'
import { Alert } from '@material-ui/lab'
import React, { useContext, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Context from '../contexts/Web3Context'
import { load as loadContract } from '../lib/phala/ethContract'

const burnToAddress = '0x000000000000000000000000000000000000dead'
const defaultAmount = 0.1

interface RecentTransaction {
    etherscanBaseUrl: string
    hash: string
}

async function burn(account: string, amount: Number, web3: Web3): Promise<RecentTransaction> {
    const { consts, contract } = await loadContract(web3)

    const wei = web3.utils.toWei(amount.toString())

    const receipt = await contract.methods
        .transfer(burnToAddress, wei)
        .send({ from: account })

    return {
        etherscanBaseUrl: consts.etherscanBaseUrl,
        hash: receipt.transactionHash
    }
}

export default function BurnPage(): JSX.Element {
    const { account, web3 } = useContext(Web3Context)

    const [isBurning, setBurning] = useState<boolean>(false)

    // amount input by user and validations

    const [amount, setAmount] = useState<Number | null>(defaultAmount)
    const [amountError, setAmountError] = useState<string | null>(null)

    const onAmountInputChanged = (input: string): void => {
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

    // local conditions preventing the exchange to proceed

    const localError = useMemo<string | null>(() => {
        if (web3 === null) return 'Ethereum wallet is not connected'
        if (account === null) return 'No Ethereum account selected'

        return null
    }, [account, web3])

    // allow user to proceed or not

    const enabled = useMemo<boolean>(
        () => web3 !== null && account !== null && amount !== null && !isBurning,
        [web3, account, amount, isBurning]
    )

    // recent transactions

    const [lastTxnError, setLastTxnError] = useState<string | null>(null)
    const [lastTxn, setLastTxn] = useState<RecentTransaction | null>(null)

    // button handler

    const startBurn = (): void => {
        setBurning(true)
        setLastTxn(null)

        if (account === null || amount === null || web3 === null) {
            return
        }

        burn(account, amount, web3)
            .then((txn) => setLastTxn(txn))
            .catch((reason) => setLastTxnError(reason))
            .finally(() => setBurning(false))
    }

    // error presentation widget

    const localConditionErrorWidget = useMemo(() => localError === null || (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                {localError}
            </span>
        </Alert>
    ), [localError])

    const lastTxnErrorWidget = useMemo(() => lastTxnError === null || (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                Transaction failed: {lastTxnError}
            </span>
        </Alert>
    ), [lastTxnError])

    const lastTxnInfoWidget = useMemo(() => {
        if (lastTxn === null) return false

        const txnInspectUrl = `${lastTxn.etherscanBaseUrl}/tx/${lastTxn.hash}`

        return (
            <Alert severity="success" style={{ marginTop: '1rem' }}>
                <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                    Transaction sent: <Link href={txnInspectUrl} rel="noreferrer" target="_blank">{lastTxn.hash}</Link>
                </span>
            </Alert >
        )
    }, [lastTxn])

    return (
        <Container>
            <TextField
                defaultValue={defaultAmount}
                error={amountError !== null}
                fullWidth
                helperText={amount !== null ? `${1000 * Number(amount)} tPHA` : ''}
                label="Amount"
                onChange={(ev) => onAmountInputChanged(ev.target.value)}
                required
            />

            <Button
                disabled={!enabled}
                onClick={() => startBurn()}
                startIcon={!isBurning ? <MonetizationOn /> : <CircularProgress />}
                style={{ marginTop: '1rem' }}
                variant="contained"
            >Exchange</Button>

            {localConditionErrorWidget}

            {lastTxnErrorWidget}

            {lastTxnInfoWidget}

            <Typography
                color='textSecondary'
                style={{ marginTop: '1rem' }}
                variant="body2"
            >
                The maximum amount to exchange is limited to 0.1 to avoid accidental asset loss. Ask in our Discord if you want to exchange more.
            </Typography>

            <Typography
                color='textSecondary'
                hidden={!(isBurning || lastTxn !== null)}
                style={{ marginTop: '1rem' }}
                variant="body2"
            >
                Please sit back and relax while the transaction is being sent and accepted by the network.
            </Typography>
        </Container >
    )
}
