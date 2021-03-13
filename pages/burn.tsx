import { TextField } from "@material-ui/core";

const burnAmountHelperText = 'The amount is restricted to 0.1 PHA to avoid accidental asset loss. Ask in our Discord if you want swap more.'

export default function Burn() {
    return (
        <div>
            <TextField defaultValue="0.1" helperText={burnAmountHelperText} label="BURN AMOUNT" required></TextField>
        </div>
    )
}