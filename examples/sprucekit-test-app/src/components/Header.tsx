import logo from '../logo.svg';

const Header = () => {
    return <div className='Header'>
        <img
            src={logo}
            className='Header-logo'
            alt='logo'
        />
        <span className='Header-span'>
            SpruceKit
        </span>
    </div>
};

export default Header;