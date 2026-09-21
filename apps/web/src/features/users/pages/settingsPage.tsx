import SideMenu from "../../../components/ui/sideMenu";
import { useState } from "react";
import Account from "../components/account";
import { type ActiveIdType } from "../types";
import Security from "../components/security";

export default function SettingsPage() {
  const [activeId, setActiveId] = useState<ActiveIdType>("account");

  function onSelect(id: ActiveIdType) {
    setActiveId(id);
  }

  return (
    <div className="w-full min-h-screen grid grid-cols-[2fr_8fr] gap-20 p-4 px-8 py-4 bg-slate-200">
      <div className="w-full">
        <SideMenu
          title="Settings"
          onSelect={onSelect}
          activeId={activeId}
          options={[
            {
              text: "Account Preferences",
              id: "account",
            },
            {
              text: "Security and Password",
              id: "security",
            },
          ]}
        />
      </div>

      <div className="w-full">
        {activeId === "account" && <Account />}
        {activeId === "security" && <Security />}
      </div>
    </div>
  );
}
