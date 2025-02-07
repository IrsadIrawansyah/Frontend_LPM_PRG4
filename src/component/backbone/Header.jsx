import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../util/Encryptor";
import { API_LINK, APPLICATION_ID } from "../util/Constants";
import { formatDate } from "../util/Formatting";
import logo from "../../assets/IMG_Logo.png";
import UseFetch from "../util/UseFetch";
import Icon from "../part/Icon";

export default function Header({ displayName, roleName, onMenuToggle }) {
  const [countNotifikasi, setCountNotifikasi] = useState("");

  function handleGetLastLogin() {
    return formatDate(
      JSON.parse(decryptId(Cookies.get("activeUser"))).lastLogin
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataCountingNotifikasiCopy",
          { application: APPLICATION_ID }
        );

        if (data === "ERROR") {
          throw new Error();
        } else {
          setCountNotifikasi(data[0].counting);
        }
      } catch {
        setCountNotifikasi("");
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between fixed-top border-bottom bg-white">
        <div className="d-flex align-items-center">
          <div
            className="p-3 ms-1"
            style={{
              cursor: "pointer",
              fontSize: "2em",
            }}
            onClick={onMenuToggle} // Panggil onMenuToggle disini
          >
            <Icon name="menu-burger" />
          </div>
          <img
            src={logo}
            alt="Logo AstraTech"
            className="p-3"
            style={{ height: "70px" }}
          />
        </div>
        <div className="pe-4 my-auto">
          <div className="d-flex justify-content-end">
            <div className="text-end">
              <p className="fw-bold mx-0 my-0">
                {displayName} ({roleName})
              </p>
              <small
                className="text-body-secondary"
                style={{ fontSize: ".7em" }}
              >
                Login terakhir: {handleGetLastLogin()} WIB
              </small>
            </div>
            <div className="my-auto ms-4 mt-2">
              <p
                className="h2 p-0 m-0 me-1"
                style={{ cursor: "pointer" }}
                onClick={() => (window.location.href = "notifikasi")}
              >
                <Icon name="envelope" />
                <span
                  className="badge rounded-pill bg-danger position-absolute top-0 end-0"
                  style={{
                    fontSize: ".35em",
                    marginTop: "12px",
                    marginRight: "20px",
                  }}
                >
                  {countNotifikasi}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
