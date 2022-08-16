import React, { useState, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { utils, Upgrader, upgradeMachine } from '@darkblock.io/shared-components'

const platform = 'Solana'
const SolUpgradeWidget = ({
  apiKey,
  tokenId,
  walletAdapter = null,
  cb = null,
  config = {
    customCssClass: '',
    debug: false,
    imgViewer: {
      showRotationControl: true,
      autoHideControls: true,
      controlsFadeDelay: true,
    },
  },
}) => {
  const [state, send] = useMachine(() => upgradeMachine(tokenId, '', platform))
  const [address, setAddress] = useState(null)

  const callback = (state) => {
    if (config.debug) console.log('Callback function called from widget. State: ', state)

    if (typeof cb !== 'function') return

    try {
      cb(state)
    } catch (e) {
      console.log('Callback function error: ', e)
    }
  }

  useEffect(() => {
    callback(state.value)
    if (!apiKey) {
      send({ type: 'NO_APIKEY' })
    }

    if (!walletAdapter) {
      send({ type: 'NO_WALLET' })
    } else {
      if (state.value === 'idle') {
        send({ type: 'FETCH_CREATOR' })
      }

      if (state.value === 'started') {
        const connectWallet = async () => {
          const checkAddress = walletAdapter.publicKey.toBase58()

          if (checkAddress) {
            setAddress(checkAddress)
            state.context.wallet_address = checkAddress
            send({ type: 'CONNECT_WALLET' })
          } else {
            send({ type: 'CONNECT_FAILED' })
          }
        }

        connectWallet()
      }

      if (state.value === 'wallet_connected') {
        send({ type: 'VERIFY_OWNER' })
      }

      if (state.value === 'verify_owner') {
        verifyOwnership()
      }

      if (state.value === 'signing') {
        signFileUploadData()
      }
    }
  }, [state.value])

  const verifyOwnership = async () => {
    let creatorDataWithOwner

    try {
      creatorDataWithOwner = await utils.getCreator('', tokenId, platform)

      let isMatch = false
      creatorDataWithOwner.all_creators.forEach((addr) => {
        if (isMatch || addr.toLowerCase() === address.toLowerCase()) {
          isMatch = true
        }
      })

      if (isMatch) {
        send({ type: 'SUCCESS' })
      } else {
        send({ type: 'FAIL' })
      }
    } catch {
      send({ type: 'FAIL' })
    }
  }

  const signFileUploadData = async () => {
    let signatureData = `${state.context.platform}${state.context.nftData.nft.token}${state.context.fileHash}`
    const encodedMessage = new TextEncoder().encode(signatureData)
    const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8')
    const signature = btoa(String.fromCharCode.apply(null, signedMessage.signature))

    if (signature) {
      state.context.signature = signature
      send({ type: 'SIGNING_SUCCESS' })
    } else {
      state.context.signature = null
      send({ type: 'SIGNING_FAIL' })
    }
  }

  return (
    <Upgrader
      apiKey={apiKey}
      state={state}
      config={config}
      authenticate={() => send({ type: 'SIGN' })}
      reset={(value) => {
        if (value === 'finished') {
          send({ type: 'COMPLETE' })
        } else {
          send({ type: 'RESET' })
        }
      }}
    />
  )
}

export default SolUpgradeWidget
