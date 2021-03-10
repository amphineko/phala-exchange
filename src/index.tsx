import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'

import { Application } from './app'

const root = document.createElement('div')
document.body.appendChild(root)

ReactDOM.render((
    <HashRouter>
        <Application />
    </HashRouter>
), root)
