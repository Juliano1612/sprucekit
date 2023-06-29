import SpruceKitComponent from '@/components/SpruceKitComponent';

export default function Home() {
  return (
    <div className='App'>
      <div className='Header'>
        <span className='Header-span'>
          SpruceKit
        </span>
      </div>
      <div className='Title'>
        <h1 className='Title-h1'>
          SpruceKit Test App
        </h1>
        <h2 className='Title-h2'>
          Connect and sign in with your Ethereum account
        </h2>
      </div>
      <div className='Content'>
        <div className='Content-container'>
          <SpruceKitComponent />
        </div>
      </div>
    </div>
  )
}