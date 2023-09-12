export function validatePhoneSuffix(value) {
  if (isNaN(value)) {
    return {
      valid: false,
      error: "The phone suffix should only contain digits.",
    };
  }
  if (value.length !== 7) {
    return {
      valid: false,
      error: "The phone suffix should be exactly 7 digits long.",
    };
  }
  return {
    valid: true,
    error: "",
  };
}

export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// export function validateId(id) {
//   id = String(id).trim();
//   if (id.length > 9) {
//     return {
//       valid: false,
//       error: "Invalid Id number: Too long.",
//     };
//   }
//
//   if (isNaN(id)) {
//     return {
//       valid: false,
//       error: "Invalid Id number: Contains non-numeric characters.",
//     };
//   }
//   id = id.length < 9 ? ("00000000" + id).slice(-9) : id;
//
//   const checksum = Array.from(id)
//     .map(Number)
//     .reduce((counter, digit, i) => {
//       const step = digit * ((i % 2) + 1);
//       return counter + (step > 9 ? step - 9 : step);
//     });
//
//   if (checksum % 10 !== 0) {
//     return {
//       valid: false,
//       error: "Invalid Israeli ID number. Please double-check.",
//     };
//   } else {
//     return {
//       valid: true,
//       error: "",
//     };
//   }
// }
