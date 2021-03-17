import { ServerStyleSheets } from '@material-ui/core'
import Document, { DocumentContext, DocumentInitialProps } from 'next/document'
import React from 'react'

export default class AppDocument extends Document {
    removeInjectedStylesheets(): void {
        const jssStyles = document.querySelector('#jss-server-side')
        jssStyles?.parentElement?.removeChild(jssStyles)
    }

    componentDidMount(): void {
        super.componentDidMount?.()
        this.removeInjectedStylesheets()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        super.componentDidUpdate?.(prevProps, prevState, snapshot)
        this.removeInjectedStylesheets()
    }

    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const muiSheets = new ServerStyleSheets()
        const originalRenderPage = ctx.renderPage

        ctx.renderPage = () => originalRenderPage({
            enhanceApp: (App) => (props) => muiSheets.collect(<App {...props} />)
        })

        const initialProps = await Document.getInitialProps(ctx)
        return {
            ...initialProps,
            styles: [
                ...React.Children.toArray(initialProps.styles),
                muiSheets.getStyleElement()
            ]
        }
    }
}
