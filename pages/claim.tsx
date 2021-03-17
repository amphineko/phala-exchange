import { Container, TextField } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { decodeAddress } from '@polkadot/util-crypto'
import { useState } from 'react'

const claimerHelperText = 'Account who claim the tokens on Phala'

export default function ClaimPage(): JSX.Element {
    const [, setClaimer] = useState<string | null>(null)
    const [claimerError, setClaimerError] = useState<string | null>(null)

    const onClaimerChanged = (input: string): void => {
        setClaimer(null)
        setClaimerError(null)

        if (input.length === 0) { return }

        try {
            decodeAddress(input) // attempt to decode address for verification
            setClaimer(input) // save if decoded without error
        } catch (error) {
            const errorString = error instanceof Error ? error.message : error
            setClaimerError(errorString.split(': ').pop() ?? 'Unknown error')
        }
    }

    return (
        <div>
            <Alert severity='warning'>This feature is currently under development</Alert>
            <Container className="container">
                <TextField
                    autoFocus
                    error={claimerError !== null}
                    fullWidth
                    helperText={claimerError ?? claimerHelperText}
                    label="Claimer"
                    onChange={(ev) => onClaimerChanged(ev.target.value)}
                />
            </Container>
        </div>
    )
}
