import SideMenu from "../../../components/ui/sideMenu";
import type { ActiveIdType } from "../types";

type OptionType = {
  id: ActiveIdType;
  text: string;
}
type SideMenuProps = {
  title?: string;
  options: OptionType[]
  onSelect: (id: ActiveIdType) => void;
  activeId: ActiveIdType;
}

export default function SettingsSideMenu({title, options, onSelect, activeId}: SideMenuProps){

  return(

    <SideMenu<ActiveIdType>
      title={title}
      options={options}
      onSelect={onSelect}
      activeId={activeId}
    />
  )
}
