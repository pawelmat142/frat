import HeaderBackBtn from 'global/header-state/HeaderBackBtn';
import { BtnModes, MenuItem } from 'global/interface/controls.interface';
import IconButton from './controls/IconButon';
import { Ico } from 'global/icon.def';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { MenuConfig } from './selector/MenuItems';

interface HeaderProps {
    onBack?: () => void,
    title?: string
    leftBtn?: React.ReactNode
    rightBtn?: React.ReactNode
    menu?: MenuConfig
}

const Header: React.FC<HeaderProps> = ({ onBack, title, rightBtn, menu, leftBtn }) => {

    const bottomSheetCtx = useBottomSheet();

    if (!!menu && !!rightBtn) {
        throw new Error("Header cannot have both rightBtn and menu props at the same time.")
    }

    return (
        <header className='header w-full'>
            <nav className='p-container h-full'>

                <div className="header-content">

                    {!!leftBtn ? leftBtn : (
                        <div className="header-content-left">
                            <HeaderBackBtn onBack={onBack} />

                            {title && (
                                <div className="header-title ml-2 btn-font">
                                    {title}
                                </div>
                            )}
                        </div>
                    )}


                    {!!(rightBtn || menu) && (
                        <div className='flex items-center'>
                            {rightBtn}
                            {menu && <IconButton mode={BtnModes.SECONDARY_TXT} icon={<Ico.MENU onClick={() => {
                                bottomSheetCtx.openMenu(menu)
                            }} />} />}
                        </div>
                    )}

                </div>

            </nav>
        </header>
    );
}

export default Header;
