import { Button, Grid, Input, Link, Note, Spinner, Text } from '@geist-ui/react'
import { ExternalLink, Send } from '@geist-ui/react-icons'
import React, { useContext, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Context from '../contexts/Web3Context'
import { load as loadContract } from '../lib/ethereum/contract'

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

        // if (value <= 0 || value > 0.1) {
        //     setAmountError('Amount to burn is out of range')
        //     return
        // }

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
        setLastTxnError(null)

        if (account === null || amount === null || web3 === null) {
            return
        }

        burn(account, amount, web3)
            .then((txn) => setLastTxn(txn))
            .catch((reason) => setLastTxnError((reason as Error)?.message ?? reason))
            .finally(() => setBurning(false))
    }

    // error presentation widget

    const localConditionErrorWidget = useMemo(() => localError === null || (
        <Note type="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                {localError}
            </span>
        </Note>
    ), [localError])

    const lastTxnErrorWidget = useMemo(() => lastTxnError === null || (
        <Note type="error" style={{ marginTop: '1rem' }}>
            <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                Transaction failed: {lastTxnError}
            </span>
        </Note>
    ), [lastTxnError])

    const lastTxnInfoWidget = useMemo(() => {
        if (lastTxn === null) return true

        const txnInspectUrl = `${lastTxn.etherscanBaseUrl}/tx/${lastTxn.hash}`

        return (
            <Note label="OK" type="success" style={{ marginTop: '1rem' }}>
                <span style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                    <Link href={txnInspectUrl} rel="noreferrer" target="_blank">
                        {lastTxn.hash}
                        <ExternalLink size="0.8rem" style={{ marginLeft: '0.25em' }} />
                    </Link>
                </span>
            </Note>
        )
    }, [lastTxn])

    return (
        <Grid.Container direction="column" gap={1}>
            <Grid>
                {localConditionErrorWidget}

                {lastTxnErrorWidget}

                {lastTxnInfoWidget}
            </Grid>

            <Grid>
                <Input
                    autoFocus
                    defaultValue={defaultAmount}
                    label="Amount"
                    labelRight="PHA"
                    onChange={(ev) => onAmountInputChanged(ev.target.value)}
                    required
                    status={amountError === null ? 'secondary' : 'error'}
                    width="100%"
                />
            </Grid>

            <Grid>
                <Button
                    auto
                    disabled={!enabled}
                    onClick={() => startBurn()}
                    icon={isBurning ? <Spinner /> : <Send />}
                    loading={isBurning}
                    type="secondary"
                >{isBurning ? 'Sending' : 'Burn'}</Button>
            </Grid>

            <Grid>
                <Text small type="secondary">
                    Please sit back and relax while the transaction is being sent and accepted by the network.
                </Text>
            </Grid>
        </Grid.Container>
    )
}
