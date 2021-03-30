import { CssBaseline } from '@geist-ui/react'
import Document, { DocumentContext, DocumentInitialProps } from 'next/document'
import React from 'react'

export default class AppDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await super.getInitialProps(ctx)
        const styles = CssBaseline.flush()

        return {
            ...initialProps,
            styles: (
                <>
                    {initialProps.styles}
                    {styles}
                </>
            )
        }
    }
}
