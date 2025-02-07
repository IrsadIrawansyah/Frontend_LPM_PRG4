// import { useEffect, useState, Suspense } from "react";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Cookies from "js-cookie";
// import { decryptId } from "./component/util/Encryptor";
// import { BASE_ROUTE, ROOT_LINK } from "./component/util/Constants";
// import CreateMenu from "./component/util/CreateMenu";
// import CreateRoute from "./component/util/CreateRoute.jsx";

// import Container from "./component/backbone/Container";
// import Header from "./component/backbone/Header";
// import SideBar from "./component/backbone/SideBar";
// import Login from "./component/page/login/Index";
// import Logout from "./component/page/logout/Index";
// import NotFound from "./component/page/not-found/Index";

// export default function App() {
//   const [listMenu, setListMenu] = useState([]);
//   const [listRoute, setListRoute] = useState([]);
//   const isLogoutPage = window.location.pathname.includes("logout");
//   const cookie = Cookies.get("activeUser");

//   if (isLogoutPage) return <Logout />;
//   else if (!cookie) return <Login />;
//   else {
//     const userInfo = JSON.parse(decryptId(cookie));

//     useEffect(() => {
//       const getMenu = async () => {
//         const menu = await CreateMenu(userInfo.role);
//         const route = CreateRoute.filter((routeItem) => {
//           const pathExistsInMenu = menu.some((menuItem) => {
//             if (menuItem.link.replace(ROOT_LINK, "") === routeItem.path) {
//               return true;
//             }
//             if (menuItem.sub && menuItem.sub.length > 0) {
//               return menuItem.sub.some(
//                 (subItem) =>
//                   subItem.link.replace(ROOT_LINK, "") === routeItem.path
//               );
//             }
//             return false;
//           });

//           return pathExistsInMenu;
//         });

//         route.push({
//           path: "/*",
//           element: <NotFound />,
//         });

//         setListMenu(menu);
//         setListRoute(route);
//       };

//       getMenu();
//     }, []);

//     return (
//       <>
//         {listRoute.length > 0 && (
//           <BrowserRouter basename={BASE_ROUTE}>
//             <Header displayName={userInfo.nama} roleName={userInfo.peran} />
//             <div style={{ marginTop: "70px" }}></div>
//             <div className="d-flex flex-row">
//               <SideBar listMenu={listMenu} />
//               <Container>
//                 <Suspense>
//                   <Routes>
//                     {listRoute.map((route, index) => (
//                       <Route
//                         key={index}
//                         path={route.path}
//                         element={route.element}
//                       />
//                     ))}
//                   </Routes>
//                 </Suspense>
//               </Container>
//             </div>
//           </BrowserRouter>
//         )}
//       </>
//     );
//   }
// }

import { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";
import { decryptId } from "./component/util/Encryptor";
import { BASE_ROUTE, ROOT_LINK } from "./component/util/Constants";
import CreateMenu from "./component/util/CreateMenu";
import CreateRoute from "./component/util/CreateRoute.jsx";

import Container from "./component/backbone/Container";
import Header from "./component/backbone/Header";
import SideBar from "./component/backbone/SideBar";
import Login from "./component/page/login/Index";
import Logout from "./component/page/logout/Index";
import NotFound from "./component/page/not-found/Index";

export default function App() {
  const [listMenu, setListMenu] = useState([]);
  const [listRoute, setListRoute] = useState([]);

  // Tambahkan state untuk kontrol sidebar (true = sidebar tampil, false = sidebar disembunyikan)
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const isLogoutPage = window.location.pathname.includes("logout");
  const cookie = Cookies.get("activeUser");

  if (isLogoutPage) return <Logout />;
  else if (!cookie) return <Login />;
  else {
    const userInfo = JSON.parse(decryptId(cookie));

    useEffect(() => {
      const getMenu = async () => {
        const menu = await CreateMenu(userInfo.role);
        const route = CreateRoute.filter((routeItem) => {
          const pathExistsInMenu = menu.some((menuItem) => {
            if (menuItem.link.replace(ROOT_LINK, "") === routeItem.path) {
              return true;
            }
            if (menuItem.sub && menuItem.sub.length > 0) {
              return menuItem.sub.some(
                (subItem) =>
                  subItem.link.replace(ROOT_LINK, "") === routeItem.path
              );
            }
            return false;
          });

          return pathExistsInMenu;
        });

        route.push({
          path: "/*",
          element: <NotFound />,
        });

        setListMenu(menu);
        setListRoute(route);
      };

      getMenu();
    }, [userInfo.role]);

    // Fungsi toggle untuk dipanggil dari Header
    const toggleMenu = () => {
      setIsMenuOpen((prev) => !prev);
    };

    return (
      <>
        {listRoute.length > 0 && (
          <BrowserRouter basename={BASE_ROUTE}>
            {/* Berikan prop toggleMenu ke Header */}
            <Header
              displayName={userInfo.nama}
              roleName={userInfo.peran}
              onMenuToggle={toggleMenu}
            />
            <div style={{ marginTop: "70px" }}></div>
            {/* Tambahkan kelas conditional pada wrapper */}
            <div
              className={`d-flex flex-row ${
                isMenuOpen ? "" : "sidebar-hidden"
              }`}
            >
              <SideBar listMenu={listMenu} />
              <Container>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    {listRoute.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                  </Routes>
                </Suspense>
              </Container>
            </div>
          </BrowserRouter>
        )}
      </>
    );
  }
}
