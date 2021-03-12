import { GeistProvider, Page } from '@geist-ui/react'
import React from 'react'

import { geistTheme } from '../styles/geistTheme'
import Account from '../widgets/Account'

import '../styles/app.css'
import styles from '../styles/app.module.css'

export default function Application(): JSX.Element {
    return (
        <GeistProvider themes={[geistTheme]} themeType='appDark'>
            <Page.Header className={styles.container}>
                <Account network={'test'} />
            </Page.Header>
        </GeistProvider>
    )
}
