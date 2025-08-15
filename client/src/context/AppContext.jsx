import { createContext, useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // Fetch Seller Status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(data.success);
    } catch {
      setIsSeller(false);
    }
  };

  // Fetch User Auth status, User Data and Cart Items
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch {
      setUser(null);
      setCartItems({});
    }
  };

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Unified cart operation function
  const updateCartItem = (itemId, quantity) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      
      if (quantity <= 0) {
        delete newCart[itemId];
        toast.success("Removed from Cart");
      } else {
        newCart[itemId] = quantity;
        toast.success(prev[itemId] ? "Cart Updated" : "Added to Cart");
      }
      
      return newCart;
    });
  };

  // Add to cart (increment quantity by 1)
  const addToCart = (itemId) => {
    updateCartItem(itemId, (cartItems[itemId] || 0) + 1);
  };

  // Remove from cart (decrement quantity by 1 or remove if 0)
  const removeFromCart = (itemId) => {
    updateCartItem(itemId, (cartItems[itemId] || 0) - 1);
  };

  // Get total count of items in cart
  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, count) => total + count, 0);
  };

  // Get total amount of cart
  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const item = products.find(product => product._id === itemId);
      return item ? total + (item.offerPrice * quantity) : total;
    }, 0).toFixed(2);
  };

  // Initialize user, seller status and products
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // Debounced cart update to server
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(async () => {
      try {
        await axios.post("/api/cart/update", { cartItems });
      } catch (error) {
        console.error("Cart update failed:", error);
        // Optionally revert cart items or show error message
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cartItems, user]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    setCartItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};