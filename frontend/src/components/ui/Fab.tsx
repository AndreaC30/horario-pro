import { Link } from "react-router-dom";
import { IoAdd } from "react-icons/io5";

type FabProps = {
  to: string;
  label: string;
};

export function Fab({ to, label }: FabProps) {
  return (
    <Link
      to={to}
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-fab transition-all duration-200 ease-out hover:bg-primary-hover active:scale-95 animate-pulse-soft"
      aria-label={label}
    >
      <IoAdd className="h-6 w-6" />
    </Link>
  );
}
