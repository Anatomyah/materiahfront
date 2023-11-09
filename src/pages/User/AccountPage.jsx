import React, { useContext, useEffect } from "react";
import { AppContext } from "../../App";
import ChangePasswordModal from "../../components/User/ChangePasswordModal";
import EditSupplierAccountModal from "../../components/User/EditSupplierAccountModal";
import AccountModal from "../../components/User/AccountModal";

const Account = () => {
  const { userDetails, isSupplier } = useContext(AppContext);

  useEffect(() => {}, [userDetails]);

  return (
    <div>
      <h1>Username: {userDetails.username}</h1>
      <h2>
        Name: {userDetails.first_name} {userDetails.last_name}
      </h2>
      <h3>Email: {userDetails.email}</h3>
      <h3>
        Phone: {userDetails.phone_prefix}-{userDetails.phone_suffix}
      </h3>
      {isSupplier && (
        <>
          <h1>Supplier Details:</h1>
          <h2>{userDetails.supplier_name}</h2>
          <h3>Quote Email: {userDetails.supplier_email}</h3>
          <h3>
            Office Phone: {userDetails.supplier_phone_prefix}-
            {userDetails.supplier_phone_suffix}
          </h3>
          <h3>Website: {userDetails.supplier_website}</h3>
        </>
      )}

      {isSupplier ? <EditSupplierAccountModal /> : <AccountModal />}

      <ChangePasswordModal
        email={userDetails.email}
        buttonText="Change Password"
      />
    </div>
  );
};
export default Account;
