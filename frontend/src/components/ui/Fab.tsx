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
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-fab transition-all duration-200 ease-out hover:bg-primary-hover hover:shadow-[0_8px_40px_rgba(37,99,235,0.45)] active:scale-95"
      aria-label={label}
    >
      <IoAdd className="h-6 w-6" />
    </Link>
  );
}
