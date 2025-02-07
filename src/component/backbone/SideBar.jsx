import Menu from "./Menu";

export default function SideBar({ listMenu }) {
  return (
    <div
      className="border-end position-fixed pt-2 overflow-y-auto sidebarMenu"
      style={{
        height: "700px",
        scrollbarWidth: "thin",
      }}
    >
      <Menu listMenu={listMenu} />
    </div>
  );
}
