import { MenuItem } from "global/interface/controls.interface";
import { IconType } from "react-icons";

interface Props {
    items: MenuItem[];
    icon?: IconType
    className?: string;
    title?: string
}

const ChecklistUi: React.FC<Props> = ({ items, icon: Icon, className, title }) => {


    if (!items.length) {
        return null;
    }

    const getIcon = (item: MenuItem) => {
        if (item.icon) {
            return <item.icon className="secondary-text" />;
        }
        if (Icon) {
            return <Icon className="secondary-text" />;
        }
        return null;
    }

    return <div className={className ? className : "mb-10 px-5"}>

        {title && <div className="secondary-text">{title}</div>}
        
        {items.map((item, index) => {

            return <div className="pl-5 pt-3 flex items-center gap-2" key={index}>
                {getIcon(item)}
                <span>{item.label}</span>
            </div>
        })}
    </div>

}
export default ChecklistUi;