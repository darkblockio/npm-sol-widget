import React, { useEffect, useState } from 'react'
import { Stack, utils, widgetMachine } from '@darkblock.io/shared-components'
import { useMachine } from '@xstate/react'
import { encode } from 'base64-arraybuffer'

const platform = 'Solana'
const contractAddress = ''

let signature, epochSignature

const SolanaDarkblockWidget = ({
  tokenId = '',
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
  dev = false,
}) => {
  const [state, send] = useMachine(() => widgetMachine(tokenId, contractAddress, platform, dev))
  const [mediaURL, setMediaURL] = useState('')
  const [stackMediaURLs, setStackMediaURLs] = useState('')
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

  const printWalletAdapter = () => {
    if (config.debug) {
      console.log('walletAdapter: ', walletAdapter)
    }
  }

  useEffect(() => {
    callback(state.value)

    if (!walletAdapter) {
      send({ type: 'NO_WALLET' })
    } else {
      if (walletAdapter && walletAdapter.connected === false) {
        printWalletAdapter()
        send({ type: 'DISCONNECT_WALLET' })
      }

      if (state.value === 'idle') {
        send({ type: 'FETCH_ARWEAVE' })
      }

      if (state.value === 'started' && walletAdapter && walletAdapter.connected) {
        if (walletAdapter.publicKey && walletAdapter.signMessage) {
          setAddress(walletAdapter.publicKey.toBase58())
        }
        send({ type: 'CONNECT_WALLET' })
      }

      if (state.value === 'start_failure') {
        // send({ type: "RETRY" })
      }

      if (state.value === 'wallet_connected') {
        printWalletAdapter()
      }

      if (state.value === 'signing') {
        authenticate()
      }

      if (state.value === 'authenticated') {
        send({ type: 'DECRYPT' })
      }

      if (state.value === 'decrypting') {
        let tokenId = state.context.tokenId
        let contractAddress = state.context.contractAddress

        if (
          state &&
          state.context &&
          state.context.arweaveData &&
          state.context.arweaveData.access &&
          state.context.arweaveData.access[0]
        ) {
          state.context.arweaveData.access[0].tags.forEach((tag) => {
            if (tag.name.toLowerCase() === 'nft-id') {
              tokenId = tag.value
            }
          })
        }

        setMediaURL(
          utils.getProxyAsset(state.context.artId, epochSignature, tokenId, contractAddress, null, platform, address)
        )

        let arrTemp = []

        state.context.display.stack.map((db) => {
          arrTemp.push(utils.getProxyAsset(db.artId, epochSignature, tokenId, contractAddress, null, platform, address))
        })

        setStackMediaURLs(arrTemp)

        setTimeout(() => {
          send({ type: 'SUCCESS' })
        }, 1000)
      }
    }
  }, [state.value, walletAdapter])

  const authenticate = async () => {
    let epoch = Date.now()
    let address = null
    let ownerDataWithOwner

    if (walletAdapter.publicKey && walletAdapter.signMessage) {
      address = walletAdapter.publicKey.toBase58()
      const msgParams = `You are unlocking content via the Darkblock Protocol.\n\nPlease sign to authenticate.\n\nThis request will not trigger a blockchain transaction or cost any fee.\n\nAuthentication Token: ${
        epoch + address
      }`
      const message = new TextEncoder().encode(msgParams)
      signature = null

      try {
        signature = await walletAdapter.signMessage(message, 'utf8')
      } catch (e) {
        console.log(e)
      } finally {
        if (signature) {
          ownerDataWithOwner = await utils.getOwner(contractAddress, tokenId, platform, address, dev)

          if (
            !ownerDataWithOwner ||
            !ownerDataWithOwner.owner_address ||
            ownerDataWithOwner.owner_address.toLowerCase() !== address.toLowerCase()
          ) {
            send({ type: 'FAIL' })
          } else {
            signature = encodeURIComponent(encode(signature)) + '_Solana'
            epochSignature = epoch + '_' + signature
            send({ type: 'SUCCESS' })
          }
        }

        send({ type: 'CANCEL' })
      }
    }
  }

  return <Stack state={state} authenticate={() => send({ type: 'SIGN' })} urls={stackMediaURLs} config={config} />
}

export default SolanaDarkblockWidget
