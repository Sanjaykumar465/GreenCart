import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets, dummyOrders } from "../../assets/assets";

const Orders = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]); // Fixed: array destructuring and initial state

  const fetchOrders = async () => {
    setOrders(dummyOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Added empty dependency array to prevent infinite loop

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>
        {orders.length > 0 ? (
          orders.map((order, orderIndex) => (
            <div
              key={orderIndex}
              className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300"
            >
              <div className="flex gap-5 max-w-80">
                <img
                  className="w-12 h-12 object-cover"
                  src={assets.box_icon}
                  alt="boxIcon"
                />
                <div>
                  {order.items.map((item, itemIndex) => (
                    <div
                      key={`${orderIndex}-${itemIndex}`}
                      className="flex flex-col"
                    >
                      <p className="font-medium">
                        {item.product.name}{" "}
                        <span className="text-primary">x {item.quantity}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm md:text-base text-black/60">
                <p className="text-black/80">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p>
                  {order.address.street}, {order.address.city},{" "}
                  {order.address.state}, {order.address.zipcode},{" "}
                  {order.address.country}
                </p>
                <p>{order.address.phone}</p>
              </div>

              <p className="font-medium text-lg my-auto">
                {currency}
                {order.amount}
              </p>

              <div className="flex flex-col text-sm md:text-base text-black/60">
                <p>Method: {order.paymentType}</p>
                <p>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>{" "}
                {/* Fixed typo */}
                <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No orders found</p> // Added fallback for empty orders
        )}
      </div>
    </div>
  );
};

export default Orders;
