/**
 * This file exports configuration values that are used throughout the application.
 */

// The backend URL the application connects to. Users can configure it based on
// their environment setting
// For example, they can set the environment variable REACT_APP_BACKEND_URL to
// the URL of the backend server before starting the React app.
// export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// ---------------------------------------------------------------------

// export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// When specifically using the Organoids EC2 instance for backend
// ORGANOIDS EC2
export const BACKEND_URL = "https://materiahstock.com/v1/";

// Default URLs for images and pdfs when no specific image or pdf is provided
export const defaultImageUrl =
  "https://materiah1.s3.eu-central-1.amazonaws.com/products/No-Image-Placeholder.svg.png";

export const defaultPdfUrl =
  "https://materiah1.s3.eu-central-1.amazonaws.com/products/PDF-Placeholder-e1500896019213.png";

// Logo URL as provided by design team
export const largeLogo =
  "https://materiah1.s3.eu-central-1.amazonaws.com/design/materiah_logo.png";

// Available phone number prefix choices
export const PHONE_PREFIX_CHOICES = [
  { value: "050", label: "050" },
  { value: "051", label: "051" },
  { value: "052", label: "052" },
  { value: "053", label: "053" },
  { value: "054", label: "054" },
  { value: "055", label: "055" },
  { value: "056", label: "056" },
  { value: "058", label: "058" },
  { value: "059", label: "059" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "08", label: "08" },
  { value: "09", label: "09" },
  { value: "071", label: "071" },
  { value: "072", label: "072" },
  { value: "073", label: "073" },
  { value: "074", label: "074" },
  { value: "076", label: "076" },
  { value: "077", label: "077" },
  { value: "079", label: "079" },
];

// Available categories for products
export const PRODUCT_CATEGORIES = [
  { value: "Matrix", label: "Matrix" },
  { value: "Medium", label: "Medium" },
  { value: "Powder", label: "Powder" },
  { value: "Enzyme", label: "Enzyme" },
  { value: "Antibody", label: "Antibody" },
  { value: "Dye", label: "Dye" },
  { value: "Hormone", label: "Hormone" },
  { value: "Medication", label: "Medication" },
  { value: "Antibiotic", label: "Antibiotic" },
  { value: "Plastics", label: "Plastics" },
  { value: "Glassware", label: "Glassware" },
  { value: "Sanitary", label: "Sanitary" },
  { value: "Lab Equipment", label: "Lab Equipment" },
];

// Measurement units for products
export const PRODUCT_MEASUREMENT_UNITS = [
  { value: "L", label: "Litres, l" },
  { value: "ML", label: "Milliliters, ml" },
  { value: "KG", label: "Kilograms,kg" },
  { value: "G", label: "Grams, g" },
  { value: "MG", label: "Milligrams, mg" },
  { value: "UG", label: "Micrograms, µg" },
  { value: "Package", label: "Package" },
  { value: "Box", label: "Box" },
];

// Storage options for products
export const PRODUCT_STORAGE_OPTIONS = [
  { value: "+4", label: "+4" },
  { value: "-20", label: "-20" },
  { value: "-40", label: "-40" },
  { value: "-80", label: "-80" },
  { value: "Other", label: "Other" },
];

// Regular expression for validating email addresses
export const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const CURRENCY_SYMBOLS = { NIS: "₪", USD: "$", EUR: "€" };
