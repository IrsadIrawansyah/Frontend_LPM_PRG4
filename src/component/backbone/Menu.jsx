import { useEffect, useState } from "react";
import Icon from "../part/Icon";
import { ROOT_LINK } from "../util/Constants";
import { Link, useLocation } from "react-router-dom";

export default function Menu({ listMenu }) {
  const location = useLocation();
  const [currentURL, setCurrentURL] = useState(
    window.location.protocol + "//" + window.location.host + location.pathname
  );
  const [activeCollapse, setActiveCollapse] = useState({});
  const [currentTitle, setCurrentTitle] = useState("");

  // Jika listMenu tidak terdefinisi atau bukan array
  if (!listMenu || !Array.isArray(listMenu)) {
    return null; // Atau tampilkan loading
  }
  function checkIcon(menu) {
    let menuIcon = "angle-down";

    switch (menu) {
      case "Logout":
        menuIcon = "sign-out-alt";
        break;
      case "Dashboard":
        menuIcon = "home";
        break;
      case "Informasi":
        menuIcon = "info";
        break;
      case "Data PKM":
        menuIcon = "document";
        break;
      case "Plotting Reviewer":
        menuIcon = "user-check";
        break;
      case "Laporan Kemajuan":
        //menuIcon = "newspaper-open";
        break;
      case "Laporan Akhir":
        // menuIcon = "newspaper-open";
        break;
      default:
        menuIcon = "angle-down";
        break;
    }

    return menuIcon;
  }

  function handleMenuAktif(title) {
    setCurrentTitle(title);
    setCurrentURL(
      window.location.protocol + "//" + window.location.host + location.pathname
    );
    if (document.getElementById("spanMenu")) {
      document.getElementById("spanMenu").innerHTML = title;
    }
  }

  function handleCollapseToggle(menuKey) {
    setActiveCollapse((prev) => {
      // Jika menu yang diklik sudah terbuka, biarkan tetap terbuka
      return {
        ...prev,
        [menuKey]: !prev[menuKey], // Membalikkan status collapse untuk menu yang diklik
      };
    });
  }

  useEffect(() => {
    let title = currentTitle;
    let currentLink = ROOT_LINK + location.pathname;
    if (title === "") {
      try {
        const foundItem = listMenu.find(
          (item) =>
            item.link === currentLink ||
            item.sub.find((subItem) => subItem.link === currentLink)
        );
        title =
          foundItem.head +
          (foundItem.sub.length > 0
            ? " - " +
              foundItem.sub.find((item) => item.link === currentLink)["title"]
            : "");
      } catch {}
    }
    handleMenuAktif(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="menu-container">
      <nav>
        {listMenu.map((menu) => {
          if (!menu.isHidden) {
            return (
              <div key={"#menucollapse" + menu["headkey"]}>
                <Link
                  className="text-decoration-none text-black fw-bold"
                  data-bs-toggle={menu["link"] === "#" ? "collapse" : ""}
                  data-bs-target={"#menucollapse" + menu["headkey"]}
                  to={menu["link"] === "#" ? "#" : menu["link"]}
                  reloadDocument={true}
                  onClick={(e) => {
                    if (menu.sub && menu.sub.length > 0) {
                      e.preventDefault(); // Cegah navigasi
                      handleCollapseToggle(menu.headkey); // Balik status collapse
                    }
                  }}
                >
                  <div
                    className={
                      "w-100 px-4 py-2 d-flex" +
                      (currentURL === menu["link"]
                        ? " bg-secondary-subtle text-black"
                        : "")
                    }
                  >
                    <Icon
                      type="Bold"
                      name={checkIcon(menu["head"])}
                      cssClass="me-2"
                      style={{ marginTop: "2px" }}
                    />
                    <span>{menu["head"]}</span>
                  </div>
                </Link>
                <div className="collapse" id={"menucollapse" + menu["headkey"]}>
                  {menu["sub"].map((sub) => {
                    return (
                      <Link
                        className="text-decoration-none text-black"
                        to={sub["link"]}
                        key={"#menucollapse" + menu["headkey"] + sub["link"]}
                        onClick={() =>
                          handleMenuAktif(menu["head"] + " - " + sub["title"])
                        }
                      >
                        <div
                          className={
                            "w-100 pe-4 py-1 d-flex fw-medium" +
                            (currentURL === sub["link"]
                              ? " bg-secondary-subtle text-black"
                              : "")
                          }
                          style={{ paddingLeft: "30px" }}
                        >
                          <Icon name="minus-small" cssClass="me-2 mt-1" />
                          <span>{sub["title"]}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }
        })}
      </nav>
    </div>
  );
}
