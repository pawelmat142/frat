import Logo from "global/components/Logo";

const MainHeaderState: React.FC = () => {
    return (
        <div className="logo">
            <Logo size={42} showName={true} />
        </div>
    )
}

export default MainHeaderState;

