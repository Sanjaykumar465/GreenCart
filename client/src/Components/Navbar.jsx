import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

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
    axios,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("api/user/logout");
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery, navigate]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.mobile-menu-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-3 border-b border-gray-300 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between w-full">
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img className="h-8 md:h-9" src={assets.logo} alt="logo" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6 md:gap-8">
          <NavLink 
            to={"/"} 
            className="text-sm md:text-base hover:text-primary transition-colors"
          >
            Home
          </NavLink>
          <NavLink 
            to={"/products"} 
            className="text-sm md:text-base hover:text-primary transition-colors"
          >
            All Products
          </NavLink>

          {/* Search component exactly as in original */}
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
              className="w-5 md:w-6 opacity-80"
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
              className="cursor-pointer px-4 md:px-6 py-1.5 md:py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm md:text-base"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <img
                src={assets.profile_icon}
                className="w-8 md:w-10 h-8 md:h-10 rounded-full cursor-pointer border-2 border-transparent group-hover:border-primary transition-colors"
                alt="Profile"
              />
              <div className="hidden group-hover:block absolute top-12 right-0 shadow-lg bg-white border border-gray-200 py-2 w-44 rounded-md z-50">
                <div
                  onClick={() => navigate("my-orders")}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-primary transition-colors text-sm"
                >
                  My Orders
                </div>
                <div
                  onClick={logout}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-red-500 transition-colors text-sm"
                >
                  Logout
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 sm:hidden">
          <div
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={assets.nav_cart_icon}
              alt="cart"
              className="w-5 opacity-80"
            />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-5 h-5 rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <img
              src={open ? assets.close_icon : assets.menu_icon}
              alt="menu"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu-container ${open ? "block" : "hidden"} sm:hidden absolute top-full left-0 w-full bg-white shadow-md py-3 px-4 border-t border-gray-200`}>
        <div className="flex flex-col gap-3">
          <NavLink 
            to={"/"} 
            onClick={() => setOpen(false)}
            className="py-2 px-3 hover:bg-gray-50 rounded-md transition-colors"
          >
            Home
          </NavLink>
          <NavLink 
            to={"/products"} 
            onClick={() => setOpen(false)}
            className="py-2 px-3 hover:bg-gray-50 rounded-md transition-colors"
          >
            All Products
          </NavLink>
          
          {user && (
            <NavLink 
              to={"/my-orders"} 
              onClick={() => setOpen(false)}
              className="py-2 px-3 hover:bg-gray-50 rounded-md transition-colors"
            >
              My Orders
            </NavLink>
          )}

          <div className="mt-2">
            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="w-full py-2 bg-primary hover:bg-primary-dull transition text-white rounded-md text-sm"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-md text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;