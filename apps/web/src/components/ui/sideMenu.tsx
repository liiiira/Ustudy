type OptionType<T> = {
  id: T;
  text: string;
};
type SideMenuProps<T> = {
  title?: string;
  options: OptionType<T>[];
  onSelect: (id: T) => void;
  activeId: T;
};

export default function SideMenu<T>({
  title,
  options,
  onSelect,
  activeId,
}: SideMenuProps<T>) {
  return (
    <div className="w-full h-max flex flex-col gap-2 bg-white rounded-xl overflow-hidden">
      <div className="font-bold text-xl px-4 py-2">{title}</div>

      <nav className="w-full h-max">
        <ul className="w-full h-max flex flex-col">
          {options.map((option: OptionType<T>) => {
            const isActive = activeId === option.id;
            return (
              <li className="w-full" key={option.id as string}>
                <button
                  className={` hover:cursor-pointer px-6 py-3 w-full h-max text-lg font-light ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "bg-white hover:bg-slate-100"
                  }                    `}
                  onClick={() => onSelect(option.id)}
                >
                  {option.text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
