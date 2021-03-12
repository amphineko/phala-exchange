import { Themes } from '@geist-ui/react'

export const geistTheme = Themes.createFromDark({
    type: 'appDark',
    palette: {
        accents_1: '#111',
        accents_2: '#333',
        accents_3: '#444',
        accents_4: '#666',
        accents_5: '#888',
        accents_6: '#999',
        accents_7: '#eaeaea',
        accents_8: '#fafafa',
        background: '#000',
        foreground: '#fff',
        selection: '#D1FF52',
        secondary: '#888',
        success: '#708634',
        successLight: '#D1FF52',
        successDark: '#D1FF52',
        code: '#79ffe1',
        border: '#333',
        link: '#D1FF52'
    },
    expressiveness: {
        dropdownBoxShadow: '0 0 0 1px #333',
        shadowSmall: '0 0 0 1px #333',
        shadowMedium: '0 0 0 1px #333',
        shadowLarge: '0 0 0 1px #333',
        portalOpacity: 0.80
    }
})
