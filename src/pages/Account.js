import React, { useContext } from "react";
import { AppContext } from "../App";
import EditAccountModal from "../components/EditAccountModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const Account = () => {
  const { userDetails } = useContext(AppContext);
  console.log(userDetails);
  return (
    <div>
      <h1>{userDetails.username}</h1>
      <h3>
        {userDetails.first_name} {userDetails.last_name}
        <p>{userDetails.id_number}</p>
        <EditAccountModal details={userDetails} />
        <p>
          {userDetails.phone_prefix}-{userDetails.phone_suffix}
        </p>
      </h3>
      <h3>{userDetails.email}</h3>
      <ChangePasswordModal
        email={userDetails.email}
        buttonText="Change Password"
      />
    </div>
  );
};
export default Account;
