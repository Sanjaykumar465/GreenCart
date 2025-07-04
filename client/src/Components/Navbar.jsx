import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
  } = useAppContext();

  const logout = async () => {
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery, navigate]);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      <NavLink to="/" onClick={() => setOpen(false)}>
        <img className="h-9" src={assets.logo} alt="logo" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <NavLink to={"/"}>Home</NavLink>
        <NavLink to={"/products"}>All Product</NavLink>
        <NavLink to={"/"}>Contact</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            type="text"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt="search" className="w-4 h-4" />
        </div>

        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={assets.nav_cart_icon}
            alt="cart"
            className="w-6 opacity-80"
          />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-5 h-5 rounded-full flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </div>

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
          >
            Login
          </button>
        ) : (
          <div className="relative group">
            <img
              src={assets.profile_icon}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent group-hover:border-primary transition-colors"
              alt="Profile"
            />
            <div className="hidden group-hover:block absolute top-14 right-0 shadow-lg bg-white border border-gray-200 py-2 w-44 rounded-md z-50">
              <div
                onClick={() => navigate("my-orders")}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-primary transition-colors"
              >
                My Orders
              </div>
              <div
                onClick={logout}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-red-500 transition-colors"
              >
                Logout
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 sm:hidden">
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={assets.nav_cart_icon}
            alt="cart"
            className="w-6 opacity-80"
          />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-5 h-5 rounded-full flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </div>
        <button
          onClick={() => (open ? setOpen(false) : setOpen(true))}
          aria-label="Menu"
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}
        >
          <NavLink to={"/"} onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to={"/products"} onClick={() => setOpen(false)}>
            All Product
          </NavLink>
          {user && (
            <NavLink to={"/my-orders"} onClick={() => setOpen(false)}>
              My Orders
            </NavLink>
          )}
          <NavLink to={"/"} onClick={() => setOpen(false)}>
            Contact
          </NavLink>
          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;