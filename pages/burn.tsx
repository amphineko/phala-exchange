import { Button, Container, TextField } from '@material-ui/core'
import MonetizationOn from '@material-ui/icons/MonetizationOn'
import { Alert } from '@material-ui/lab'
import React, { useContext, useMemo, useState } from 'react'
import Web3Context from '../contexts/Web3Context'

const burnAmountHelperText = 'NOTE: The maximum amount to exchange is limited to 0.1 to avoid accidental asset loss. Ask in our Discord if you want to exchange more.'

export default function Burn(): JSX.Element {
    const web3 = useContext(Web3Context)

    const [amountError, setAmountError] = useState<string | undefined>(undefined)
    const enabled = useMemo(() => web3 !== null, [web3])

    const handleAmountChange = (value: string): void => {
        const float = Number(value)
        if (isNaN(float)) {
            setAmountError('ERROR: Not a number')
            return
        }
        if (float <= 0 || float > 0.1) {
            setAmountError('ERROR: Out of range')
            return
        }
        setAmountError(undefined)
    }

    return (
        <Container>
            <TextField
                defaultValue={0.1}
                error={amountError !== undefined}
                fullWidth
                helperText={amountError === undefined ? burnAmountHelperText : amountError}
                label="Amount"
                onChange={(ev) => handleAmountChange(ev.target.value)}
                required
            />
            <Button
                disabled={!enabled}
                startIcon={<MonetizationOn />}
                style={{ marginTop: '1rem' }}
                variant="contained"
            >Exchange</Button>
            {enabled || (
                <Alert severity="error" style={{ marginTop: '1rem' }}>Ethereum is not connected</Alert>
            )}
        </Container >
    )
}
