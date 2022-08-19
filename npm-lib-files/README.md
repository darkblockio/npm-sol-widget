# Darkblock.io React Component Library

## Getting Started 🚀

Install Darkblock's React Component Library using `yarn` or `npm`

```
yarn add @darkblock.io/sol-widget
```

```
npm i @darkblock.io/sol-widget --save
```

Once the library is installed, import or require components into your codebase

```
import "@darkblock.io/sol-widget"

require("@darkblock.io/sol-widget")
```

## Solana Widget Component

### Input

- **tokenId:** id of the NFT in Solana
- **walletAdapter:** wallet context state object returned from `useWallet()`
- **cb:** callback function to be triggered on the widget's state change (optional)
- **config:** config object (optional)

**cb** function example, the callback function will have the widget's state passed as a parameter:

```
const cb = (param) => {
  console.log(param)
}
```

**config** object's default value:

```
{
  customCssClass: "",             // pass here a class name you plan to use
  debug: false,                   // debug flag to console.log some variables
  imgViewer: {                    // image viewer control parameters
    showRotationControl: true,
    autoHideControls: true,
    controlsFadeDelay: true,
  },
}
```

### Example Viewer

This component needs to be used within the scope of the Solana Wallet Adapter component. `useWallet` should also be
called under the Wallet Adapter scope:

```
import { ConnectionProvider, WalletProvider, useWallet } from "@solanawallet-adapter-react"
import SolanaDarkblockWidget from "@darkblock.io/sol-widget"

const Widget = () => {
  const walletAdapter = useWallet()

  return (
    <SolanaDarkblockWidget
      tokenId="HgYuunWM9Hpi2oc3MpK31yvURoZhSog13jTbjQYYjPM"
      walletAdapter={walletAdapter}
      cb={cb}
      config={config}
    />
  )
}

const Main = () => {
  ...

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />

          <Widget />

        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Main

```

### Example Add Content

This component needs to be used within the scope of the Solana Wallet Adapter component. `useWallet` should also be
called under the Wallet Adapter scope:

```
import { ConnectionProvider, WalletProvider, useWallet } from "@solanawallet-adapter-react"
import SolanaDarkblockWidget from "@darkblock.io/sol-widget"

const Widget = () => {
  const walletAdapter = useWallet()
  
  const apiKey = '** contact darkblock for apikey **'

  return (
    <SolUpgradeWidget 
      apiKey={apiKey} 
      tokenId={HgYuunWM9Hpi2oc3MpK31yvURoZhSog13jTbjQYYjPM} 
      walletAdapter={wallAdapter} 
      cb={(p) => console.log(p)} 
      config={config} 
    />
  )
}

const Main = () => {
  ...

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />

          <Widget />

        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Main

```