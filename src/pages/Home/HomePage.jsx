import React, { useContext } from "react";
import { AppContext } from "../../App";
import "./HomeStyle.css";

const HomePage = () => {
  const { notifications } = useContext(AppContext);

  return (
    <div className="background-image-2">
      {notifications &&
        notifications.map((notification) => (
          <div key={notification.pk}>
            <h3>{notification.fields.product_name}</h3>
            <h3>{notification.fields.product_cat_num}</h3>
            <h3>{notification.fields.supplier_name}</h3>
            <h3>{notification.fields.current_stock}</h3>
            <h3>{notification.fields.last_ordered}</h3>
            <h3>{notification.fields.avg_order_time}</h3>
          </div>
        ))}
    </div>
  );
};
export default HomePage;
