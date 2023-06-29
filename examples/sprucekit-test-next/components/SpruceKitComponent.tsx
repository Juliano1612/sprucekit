"use client";
import { SpruceKit } from "@spruceid/sprucekit";
import { useState } from "react";
import Button from "./Button";
import AccountInfo from "./AccountInfo";

const SpruceKitComponent = () => {

  const [skProvider, setSpruceKit] = useState<SpruceKit | null>(null);

  const spruceKitHandler = async () => {
    const sk = new SpruceKit({
      providers: {
        server: {
          host: "http://localhost:3000/api"
        }
      },
    });
    await sk.signIn();
    setSpruceKit(sk);
  };

  const spruceKitLogoutHandler = async () => {
    skProvider?.signOut();
    setSpruceKit(null);
  };

  const address = skProvider?.address() || '';

  return (
    <>
      {
        skProvider ?
          <>
            <Button onClick={spruceKitLogoutHandler}>
              SIGN-OUT
            </Button>
            <AccountInfo
              address={skProvider?.address()}
              session={skProvider?.session()}
            />
          </> :
          <Button onClick={spruceKitHandler}>
            SIGN-IN WITH ETHEREUM
          </Button>
      }
    </>
  );
};

export default SpruceKitComponent;