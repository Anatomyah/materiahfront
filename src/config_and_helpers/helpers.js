import { validateToken } from "../clients/user_client";
import { toast } from "react-toastify";
import {
  differenceInMonths,
  differenceInWeeks,
  differenceInDays,
} from "date-fns";

/**
 * Initializes the application by loading saved user information from storage.
 *
 * This function is called when the application is loaded. It checks local storage and session storage for previous user information.
 * If found, it validates the saved authentication token. If the token is valid, it sets the user's information and other saved states.
 * If the token is not valid or expired, it informs the user and clears the state.
 * If no saved user information is found in local storage or session storage, it simply sets the app's loading state to false.
 *
 * @async
 * @param {function} setRememberMe - State setter function for the 'rememberMe' boolean state.
 * @param {function} setToken - State setter function for the 'token' string state.
 * @param {function} setUserDetails - State setter function for the 'userDetails' object state.
 * @param {function} setNotifications - State setter function for the 'notifications' array state.
 * @param {function} setIsSupplier - State setter function for the 'isSupplier' boolean state.
 * @param {function} setIsLoading - State setter function for the 'isLoading' boolean state.
 * @param {function} setCart - State setter function for the 'cart' array state.
 * @returns {Promise<void>}
 * @throws Will throw an error if there's an issue with the validateToken() async function call.
 */
export const initializeApp = async (
  setRememberMe,
  setToken,
  setUserDetails,
  setNotifications,
  setIsSupplier,
  setIsLoading,
  setCart,
) => {
  // Select appropriate storage type based on whether 'rememberMe' was set
  let storage;
  if (localStorage.getItem("rememberMe") === "true") {
    storage = localStorage;
  } else if (sessionStorage.getItem("token")) {
    storage = sessionStorage;
  } else {
    // If there was no 'rememberMe' or valid session, finish initialization as there are no saved user details
    setIsLoading(false);
    return;
  }

  // Get saved user details and session data
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

  // If we have a saved token, validate it
  if (savedToken) {
    const response = await validateToken(savedToken);
    // If the token is invalid or was null, notify the user if it was a session and clear the token state
    if (!response || !response.success) {
      if (storage === sessionStorage && savedToken) {
        alert("Your session has expired. Please log in again.");
      }
      setToken(null);
    } else {
      // If the token is valid, restore the saved user details and session state
      setToken(savedToken);
      setUserDetails(savedUserDetails);
      setNotifications(savedNotifications);
      setIsSupplier(savedIsSupplier);
      if (savedCart) {
        setCart(savedCart);
      }
    }
  }

  // Set the isLoading state to false, indicating that initialization has completed
  setIsLoading(false);
};

/**
 * This function creates a handler for the `beforeunload` window event that saves the application's state to storage.
 *
 * The created handler saves the current application state to either local storage or session storage. This includes the authentication token,
 * user details, notifications, supplier status, 'remember me' selection, and the shopping cart.
 * It then returns this handler function.
 *
 * @param {string} storageType - The type of web storage to use, either 'localStorage' or 'sessionStorage'.
 * @param {string} token - The current token of the authenticated user.
 * @param {Object} userDetails - The details of the authenticated user.
 * @param {Array} notifications - The current notifications for the user.
 * @param {boolean} isSupplier - A flag indicating if the current authenticated user is a supplier.
 * @param {boolean} rememberMe - A flag indicating if the 'Remember Me' option was selected during login.
 * @param {Array} cart - The current state of the shopping cart.
 * @returns {function} - The created handler function for the `beforeunload` window event.
 */
export const createBeforeUnloadHandler = (
  storageType,
  token,
  userDetails,
  notifications,
  isSupplier,
  rememberMe,
  cart,
) => {
  // Return a function to handle beforeunload event
  return () => {
    // Choose the appropriate storage based on storageType
    let storage =
      storageType === "localStorage" ? localStorage : sessionStorage;

    // Save the current state to the chosen storage
    storage.setItem("token", token);
    storage.setItem("userDetails", JSON.stringify(userDetails));
    storage.setItem("notifications", JSON.stringify(notifications));
    storage.setItem("isSupplier", String(isSupplier));
    storage.setItem("rememberMe", String(rememberMe));
    storage.setItem("cart", JSON.stringify(cart));
  };
};

/**
 * Recursively deletes specified properties in an object.
 *
 * This function traverses into the given object and removes properties whose keys match with any key in the provided `propsToDelete` array.
 * This deep deletion happens recursively, so if a property value is an object itself, the function will recurse into it and remove matching properties there as well.
 *
 * @param {Object} obj - The object whose properties should be deleted.
 * @param {Array<string>} propsToDelete - An array of property keys (strings) which should be removed.
 * @returns {Object} - The modified object with the specified properties deleted. Note: Original object is modified and also returned
 */
export function deepDeleteProperties(obj, propsToDelete) {
  // Iterate over each property in the object
  for (const key in obj) {
    // Check if the property belongs to this object (not inherited)
    if (obj.hasOwnProperty(key)) {
      // Check if the current key is included in the list of properties to delete
      if (propsToDelete.includes(key)) {
        // Delete the property from the object
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // If the property value is an object itself, recurse into it
        deepDeleteProperties(obj[key], propsToDelete);
      }
    }
  }
  // Return the modified object
  return obj;
}

/**
 * Extract entities from a list of objects and update entity selection list.
 *
 * This function takes a list of objects and extracts entities specified by `entityType`.
 * Then it adds these entities to an existing entity list without duplication.
 *
 * Entities are either directly under `entityType` of input object or under a property named as plural form of `entityType`.
 * Adds unique entities into an array used for a selection list in the UI. If there are pre-existing entities, it does not overwrite them but appends the new unique entities.
 *
 * @param {Array<Object>} objList - The array of objects to extract entities from.
 * @param {Function} setEntityList - The setter function for the selection list. This function should take a new list and update the existing selection list state.
 * @param {string} entityType - The type of the entities to be extracted.
 */
export const extractEntitiesSelectList = (
  objList,
  setEntityList,
  entityType,
) => {
  // Add 's' to entityType to get the plural form
  const pluralEntityType = entityType + "s";

  // Iterate over objList to find and extract entities
  const entityObjects = objList.flatMap((obj) => {
    // Entities could be under the pluralEntityType or entityType property
    const entities = obj[pluralEntityType] || obj[entityType];
    // If no entity found return an empty array
    if (!entities) return [];
    // If entities are not already an array (i.e., a single entity), make it into a one-item array
    return Array.isArray(entities) ? entities : [entities];
  });

  // Use the setEntityList function to update the state of the entity list
  setEntityList((prevEntities) => {
    // Create a Set for quickly looking up the IDs of existing entities
    const existingEntityIds = new Set(prevEntities.map((entity) => entity?.id));
    // Create another Set to keep track of the IDs of new unique entities
    const uniqueEntityIds = new Set();

    // Filter the entityObjects to only include new unique entities
    const updatedEntitySelectList = entityObjects.filter((entity) => {
      // If the entity exists and its ID is not in existingEntityIds or uniqueEntityIds,
      // add it to uniqueEntityIds and include the entity in updatedEntitySelectList
      if (
        entity &&
        !existingEntityIds.has(entity.id) &&
        !uniqueEntityIds.has(entity.id)
      ) {
        uniqueEntityIds.add(entity.id);
        return true;
      }
      // Exclude entity if it doesn't meet the criteria
      return false;
    });

    // Merge the entities already in state with the new unique entities
    // for the updated selection list
    return [...prevEntities, ...updatedEntitySelectList];
  });
};
/**
 * Filters objects by entity ID.
 *
 * This function takes a list of objects and filters them based on whether they contain an entity with a specified ID.
 * It handles both cases where the entities are stored in arrays and directly as object properties.
 * The entityType is used to determine which property in each object to check for entities.
 *
 * @param {string} entityId - The ID of the entity to filter by. Should be a string because it's converted to a number within the function.
 * @param {Array<Object>} objList - The list of objects to filter.
 * @param {Function} setFilteredList - The setter function for the filtered list. This function should take a new list and update the existing filtered list state.
 * @param {string} entityType - The type of the entities to filter by.
 */
export const filterObjectsByEntity = (
  entityId,
  objList,
  setFilteredList,
  entityType,
) => {
  // Add 's' to entityType to get the plural form of entityType
  const pluralEntityType = entityType + "s";

  // Filter the list of objects
  const filteredObjList = objList.filter((obj) => {
    // Entities could be found under the entityType or pluralEntityType property
    const entities = obj[pluralEntityType] || obj[entityType];
    // Exclude the obj if no entity is found
    if (!entities) return false;

    /* If entities are in an array, return true if at least one entity
    has an id that matches entityId. Otherwise, return whether the single entity's
    id is equal to entityId. */
    if (Array.isArray(entities)) {
      return entities.some((entity) => entity?.id === parseInt(entityId, 10));
    } else {
      return entities?.id === parseInt(entityId, 10);
    }
  });

  // Update the filtered list by using the setFilteredList function
  setFilteredList(filteredObjList);
};

/**
 * Displays a toast notification with a given message, type, and position.
 *
 * This function is a wrapper for the toast function from react-toastify library. It sets some default options for the toast and makes it easier to call in app.
 * Toast is used to display brief notifications that appear at a specified position on the screen and disappear after a few seconds.
 * You can set the message, type (such as success, error, warn, info), and position for the toast.
 *
 * @param {string} message - The message to display in the toast.
 * @param {string} type - The type of toast. This sets the icon and styling for the toast. Can be one of the following: "info", "success", "warning", "error".
 * @param {string} position - The position of the toast on the screen. Can be one of the following: "top-right", "top-center", "top-left", "bottom-right", "bottom-center", "bottom-left".
 */
export const showToast = (message, type, position) => {
  // Call the toast function with the message, type and position. Set some default options.
  toast[type](message, {
    position: position,
    autoClose: 3000, // Toast will disappear after 3 seconds
    hideProgressBar: false, // Show the progress bar
    closeOnClick: true, // Close the toast when clicked
    pauseOnHover: true, // Pause the timer when mouse hovers over the toast
    draggable: true, // Make the toast draggable
    progress: undefined, // Do not set a custom progress bar value
    theme: "light", // Use the colored theme for the toast
  });
};

/**
 * Check if the expiry date is within six months from the current date.
 *
 * @param {string} expiryDateString - The expiry date string in format "YYYY-MM-DD".
 * @returns {string|boolean} - Returns a string representation of the time difference in months, weeks, and days if
 * the expiry date is within six months, otherwise returns false.
 */
export const isExpiryInSixMonths = (expiryDateString) => {
  const expiryDate = new Date(expiryDateString);
  const currentDate = new Date();

  // Calculate the difference in months between the current date and the expiry date
  const monthDifference = differenceInMonths(expiryDate, currentDate);

  // set the default result
  let result = { expired: false };

  // If the expiry date is within six months, a string with time left until expiry and store it in the result object
  if (monthDifference <= 6) {
    const daysAfterMonths = differenceInDays(
      expiryDate,
      new Date(currentDate.setMonth(currentDate.getMonth() + monthDifference)),
    );
    const weeks = Math.floor(daysAfterMonths / 7);
    const days = daysAfterMonths % 7;

    result.expired = true;
    result.timeTillExpiry = `(${monthDifference} M, ${weeks} W, ${days} D)`;
  }

  return result;
};
