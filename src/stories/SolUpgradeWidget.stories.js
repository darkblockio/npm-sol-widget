import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import SolUpgradeWidget from '../lib/SolUpgradeWidget'

import { Connection, clusterApiUrl } from '@solana/web3.js'

const stories = storiesOf('Ethereum Upgrade Widget', module)

stories.add('Add Content', () => {
  const cb = (param1) => {
    console.log('upgrade cb', param1)
  }

  const createConnection = () => {
    return new Connection(clusterApiUrl('devnet'))
  }

  const Widget = () => {
    const [walletAdapter, setWalletAdapter] = useState(null)
    const [loaded, setLoaded] = useState(true)

    const apiKey = '' //Darkblock API key goes here

    return (
      <div style={{ maxWidth: '700px' }}>
        {loaded && (
          <>
            <button onClick={createConnection}>connect</button>
            <SolUpgradeWidget
              apiKey={apiKey}
              tokenId="HgYuunWM9Hpi2oc3MpK31yvURoZhSog13jTbjQYYjPM"
              walletAdapter={walletAdapter}
              cb={cb}
              config={{
                customCssClass: 'custom-class',
                debug: false,
                imgViewer: {
                  showRotationControl: true,
                  autoHideControls: true,
                  controlsFadeDelay: true,
                },
              }}
              dev={false}
            />
          </>
        )}
      </div>
    )
  }

  return <Widget />
})
