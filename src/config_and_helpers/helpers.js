import { validateToken } from "../clients/user_client";
import { toast } from "react-toastify";
import { useContext } from "react";
import { CartAppContext } from "../App";

export const initializeApp = async (
  setRememberMe,
  setToken,
  setUserDetails,
  setNotifications,
  setIsSupplier,
  setIsLoading,
  setCart,
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
  const savedNotifications =
    storage.getItem("notifications") === "undefined"
      ? null
      : JSON.parse(storage.getItem("notifications"));

  const savedIsSupplier = storage.getItem("isSupplier") === "true";

  const savedCart =
    JSON.parse(storage.getItem("cart")) === "null"
      ? null
      : JSON.parse(storage.getItem("cart"));

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
      setNotifications(savedNotifications);
      setIsSupplier(savedIsSupplier);
      if (savedCart) {
        setCart(savedCart);
      }
    }
  }

  setIsLoading(false);
};

export const createBeforeUnloadHandler = (
  storageType,
  token,
  userDetails,
  notifications,
  isSupplier,
  rememberMe,
  cart,
) => {
  return () => {
    let storage =
      storageType === "localStorage" ? localStorage : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("userDetails", JSON.stringify(userDetails));
    storage.setItem("notifications", JSON.stringify(notifications));
    storage.setItem("isSupplier", String(isSupplier));
    storage.setItem("rememberMe", String(rememberMe));
    storage.setItem("cart", JSON.stringify(cart));
  };
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

export const extractEntitiesSelectList = (
  objList,
  setEntityList,
  entityType,
) => {
  const pluralEntityType = entityType + "s";

  const entityObjects = objList.flatMap((obj) => {
    const entities = obj[pluralEntityType] || obj[entityType];
    if (!entities) return [];
    return Array.isArray(entities) ? entities : [entities];
  });

  setEntityList((prevEntities) => {
    const existingEntityIds = new Set(prevEntities.map((entity) => entity?.id));
    const uniqueEntityIds = new Set();

    const updatedEntitySelectList = entityObjects.filter((entity) => {
      if (
        entity &&
        !existingEntityIds.has(entity.id) &&
        !uniqueEntityIds.has(entity.id)
      ) {
        uniqueEntityIds.add(entity.id);
        return true;
      }
      return false;
    });

    return [...prevEntities, ...updatedEntitySelectList];
  });
};

export const filterObjectsByEntity = (
  entityId,
  objList,
  setFilteredList,
  entityType,
) => {
  const pluralEntityType = entityType + "s";

  const filteredObjList = objList.filter((obj) => {
    const entities = obj[pluralEntityType] || obj[entityType];
    if (!entities) return false;

    if (Array.isArray(entities)) {
      return entities.some((entity) => entity?.id === parseInt(entityId, 10));
    } else {
      return entities?.id === parseInt(entityId, 10);
    }
  });

  setFilteredList(filteredObjList);
};

export const showToast = (message, type, position) => {
  toast[type](message, {
    position: position,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
};
