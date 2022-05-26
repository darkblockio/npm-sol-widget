import React from 'react'
import { storiesOf } from '@storybook/react'
import SolanaDarkblockWidget from '../lib/SolWidget'

const stories = storiesOf('Solana Darkblock Widget', module)

stories.add('App', () => {
  const walletAdapter = { connected: false }

  return <SolanaDarkblockWidget tokenId="HgYuunWM9Hpi2oc3MpK31yvURoZhSog13jTbjQYYjPM" walletAdapter={walletAdapter} />
})
