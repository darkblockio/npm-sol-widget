import React from 'react'
import { storiesOf } from '@storybook/react'
import SolanaDarkblockWidget from '../lib/SolWidget'

const stories = storiesOf('Solana Darkblock Widget', module)

stories.add('View/Player', () => {
  const cb = (param1) => {
    console.log(param1)
  }

  const walletAdapter = { connected: false }

  return (
    <SolanaDarkblockWidget
      tokenId="HgYuunWM9Hpi2oc3MpK31yvURoZhSog13jTbjQYYjPM"
      walletAdapter={walletAdapter}
      cb={cb}
      config={{
        customCssClass: 'custom-class',
        debug: true,
        imgViewer: {
          showRotationControl: true,
          autoHideControls: true,
          controlsFadeDelay: true,
        },
      }}
      dev={false}
    />
  )
})
