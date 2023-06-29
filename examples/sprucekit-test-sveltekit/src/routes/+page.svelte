<script lang="ts">
  import AccountInfo from "../components/AccountInfo.svelte"
  import Button from "../components/Button.svelte"
  import { SpruceKit } from "@spruceid/sprucekit"

  let skProvider = null
  $: skProvider

  const spruceKitHandler = async () => {
    const sk = new SpruceKit({
      providers: {
        server: {
          host: "http://localhost:5173/api"
        }
      },
    })
    await sk.signIn()
    skProvider = sk
  }

  const spruceKitLogoutHandler = async () => {
    skProvider?.signOut()
    skProvider = null
  }
</script>

{#if skProvider}
  <Button onClick={spruceKitLogoutHandler}>SIGN-OUT</Button>
  <AccountInfo address={skProvider?.address()} session={skProvider?.session()} />
{:else}
  <Button onClick={spruceKitHandler}>SIGN-IN WITH ETHEREUM</Button>
{/if}
