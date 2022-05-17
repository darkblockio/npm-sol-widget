import React, { useEffect, useState } from "react";
import {
  Header,
  Panel,
  Player,
  utils,
  widgetMachine,
} from "@darkblock.io/shared-components";
import { useMachine } from "@xstate/react";
import { encode } from "base64-arraybuffer";
import "./db.css";

const platform = "Solana";
const contractAddress = "";

let signature, epochSignature;

const SolanaDarkblockWidget = ({
  tokenId = "",
  walletAdapter = null,
  cb = null,
  config = {
    customCssClass: "",
    debug: false,
    imgViewer: {
      showRotationControl: true,
      autoHideControls: true,
      controlsFadeDelay: true,
    },
  },
}) => {
  const [state, send] = useMachine(() =>
    widgetMachine(tokenId, contractAddress, platform)
  );
  const [mediaURL, setMediaURL] = useState("");

  const callback = (state) => {
    if (config.debug)
      console.log("Callback function called from widget. State: ", state);

    if (typeof cb !== "function") return;

    try {
      cb(state);
    } catch (e) {
      console.log("Callback function error: ", e);
    }
  };

  const printWalletAdapter = () => {
    if (config.debug) {
      console.log("walletAdapter: ", walletAdapter);
    }
  };

  useEffect(() => {
    callback(state.value);

    if (walletAdapter && walletAdapter.connected === false) {
      printWalletAdapter();
      send({ type: "DISCONNECT_WALLET" });
    }

    if (state.value === "idle") {
      send({ type: "FETCH_ARWEAVE" });
    }

    if (state.value === "started" && walletAdapter.connected) {
      send({ type: "CONNECT_WALLET" });
    }

    if (state.value === "start_failure") {
      // send({ type: "RETRY" })
    }

    if (state.value === "wallet_connected") {
      printWalletAdapter();
    }

    if (state.value === "signing") {
      authenticate();
    }

    if (state.value === "authenticated") {
      send({ type: "DECRYPT" });
    }

    if (state.value === "decrypting") {
      setMediaURL(
        utils.getProxyAsset(
          state.context.artId,
          epochSignature,
          state.context.tokenId,
          state.context.contractAddress,
          null,
          platform
        )
      );
      setTimeout(() => {
        send({ type: "SUCCESS" });
      }, 2000);
    }
  }, [state.value, walletAdapter.connected]);

  const authenticate = async () => {
    let epoch = Date.now();
    let address = null;

    if (walletAdapter.publicKey && walletAdapter.signMessage) {
      address = walletAdapter.publicKey.toBase58();
      const message = new TextEncoder().encode(epoch + address);
      signature = null;

      try {
        signature = await walletAdapter.signMessage(message, "utf8");
      } catch (e) {
        console.log(e);
      } finally {
        if (signature) {
          if (state.context.owner.owner_address === address) {
            signature = encodeURIComponent(encode(signature)) + "_Solana";
            epochSignature = epoch + "_" + signature;
            send({ type: "SUCCESS" });
          } else {
            send({ type: "FAIL" });
          }
        }

        send({ type: "CANCEL" });
      }
    }
  };

  return (
    <div
      className={
        config.customCssClass
          ? `DarkblockWidget-App ${config.customCssClass}`
          : `DarkblockWidget-App`
      }
    >
      {state.value === "display" ? (
        <Player
          mediaType={state.context.display.fileFormat}
          mediaURL={mediaURL}
          config={config.imgViewer}
        />
      ) : (
        <Header state={state} authenticate={() => send({ type: "SIGN" })} />
      )}
      <Panel state={state} />
      {config.debug && <p>{state.value}</p>}
    </div>
  );
};

export default SolanaDarkblockWidget;
