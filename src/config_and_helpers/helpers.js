import { validateToken } from "../clients/user_client";

export const initializeApp = async (
  setRememberMe,
  setToken,
  setUserDetails,
  setIsSupplier,
  setIsLoading,
) => {
  let storage;

  if (localStorage.getItem("rememberMe") === "true") {
    storage = localStorage;
  } else if (sessionStorage.getItem("token")) {
    storage = sessionStorage;
  } else {
    setIsLoading(false);
    return;
  }

  const savedToken =
    storage.getItem("token") === "null" ? null : storage.getItem("token");
  const savedUserDetails = JSON.parse(storage.getItem("userDetails"));
  const savedIsSupplier = storage.getItem("isSupplier") === "true";

  if (savedToken) {
    const response = await validateToken(savedToken);
    if (!response || !response.success) {
      if (storage === sessionStorage && savedToken) {
        alert("Your session has expired. Please log in again.");
      }
      setToken(null);
    } else {
      setToken(savedToken);
      setUserDetails(savedUserDetails);
      setIsSupplier(savedIsSupplier);
    }
  }

  setIsLoading(false);
};

export const createBeforeUnloadHandler = (
  storageType,
  token,
  userDetails,
  isSupplier,
  rememberMe,
) => {
  return () => {
    let storage =
      storageType === "localStorage" ? localStorage : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("userDetails", JSON.stringify(userDetails));
    storage.setItem("isSupplier", String(isSupplier));
    storage.setItem("rememberMe", String(rememberMe));

    console.log({
      token,
      userDetails,
      isSupplier,
      rememberMe,
    });
  };
};

export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export const allQuoteItemsFilled = (items) => {
  return items.every((item) => {
    return item.product !== "" && item.quantity !== "" && item.price !== "";
  });
};

export const allOrderItemsFilled = (items) => {
  return items.every((item) => {
    return (
      item.product !== "" &&
      item.quantity !== "" &&
      item.price !== "" &&
      item.batch !== ""
    );
  });
};

export const valueIsPositive = (value) => {
  return value > 0;
};

export const valueIsWhole = (value) => {
  return Number.isInteger(Number(value));
};

export function deepDeleteProperties(obj, propsToDelete) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (propsToDelete.includes(key)) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        deepDeleteProperties(obj[key], propsToDelete);
      }
    }
  }
  return obj;
}
