import React, { useContext } from "react";
import { AppContext } from "../App";
import EditAccountModal from "../components/EditAccountModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import EditSupplierAccountModal from "../components/EditSupplierAccountModal";

const Account = () => {
  const { userDetails, isSupplier } = useContext(AppContext);
  return (
    <div>
      <h1>{userDetails.username}</h1>
      <h3>
        {userDetails.first_name} {userDetails.last_name}
      </h3>
      {isSupplier && <p>{userDetails.id_number}</p>}
      {isSupplier ? (
        <p>
          {userDetails.contact_phone_prefix}-{userDetails.contact_phone_suffix}
        </p>
      ) : (
        <p>
          {userDetails.phone_prefix}-{userDetails.phone_suffix}
        </p>
      )}
      <h3>{userDetails.email}</h3>
      {isSupplier && <h3>{userDetails.contact_email}</h3>}

      {isSupplier ? (
        <EditSupplierAccountModal details={userDetails} />
      ) : (
        <EditAccountModal details={userDetails} />
      )}
      <ChangePasswordModal
        email={userDetails.email}
        buttonText="Change Password"
      />
    </div>
  );
};
export default Account;
