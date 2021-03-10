import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { ConnectTab } from './Connect'

export function Application(): JSX.Element {
    return (
        <Switch>
            <Route exact path="/">
                <ConnectTab />
            </Route>
        </Switch>
    )
}
