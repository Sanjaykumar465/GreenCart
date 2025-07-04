import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();

  return (
    product && (
      <div
        onClick={() => {
          navigate(
            `/products/${product.category.toLowerCase()}/${product._id}`
          );
          scrollTo(0, 0);
        }}
        className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-center h-40 mb-4">
          <img
            className="h-full object-contain transition-transform hover:scale-105"
            src={product.image[0]}
            alt={product.name}
          />
        </div>
        <div className="text-gray-600">
          <p className="text-sm text-gray-500">{product.category}</p>
          <p className="text-gray-800 font-medium text-lg my-1 truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-1 mb-3">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  key={i}
                  className="w-4"
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt=""
                />
              ))}
            <span className="text-sm text-gray-500">(4)</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-semibold text-primary">
                {currency} {product.offerPrice}
              </p>
              <p className="text-sm text-gray-400 line-through">
                {currency} {product.price}
              </p>
            </div>
            {!cartItems[product._id] ? (
              <button
                className="bg-primary/10 text-primary px-3 py-1 rounded-md border border-primary/30 flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product._id);
                }}
              >
                <img src={assets.cart_icon} alt="cart" className="w-4" />
                Add
              </button>
            ) : (
              <div
                className="flex items-center gap-2 bg-primary/20 rounded-md px-2 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="text-primary font-bold"
                >
                  -
                </button>
                <span className="w-6 text-center">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="text-primary font-bold"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default ProductCard;
