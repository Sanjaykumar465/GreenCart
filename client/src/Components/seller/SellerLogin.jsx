import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data } = await axios.post(
        "/api/seller/login", 
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
        toast.success("Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      let errorMessage = "Login failed";
      
      if (error.response) {
        // Handle different status codes
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className="min-h-screen flex items-center text-sm text-gray-600">
      <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">Seller</span>Login
        </p>
        
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value.trim())}
            value={email}
            type="email"
            placeholder="enter your email"
            className="border border-gray-2 rounded w-full p-2 mt-1 outline-primary"
            required
          />
        </div>
        
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="enter your password"
            className="border border-gray-2 rounded w-full p-2 mt-1 outline-primary"
            required
            minLength="6"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-primary text-white w-full py-2 rounded-md cursor-pointer ${
            isLoading ? "opacity-70" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default SellerLogin;