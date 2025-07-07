// Schema modules for better organization
export { authSchemas } from "./auth";
export { surveySchemas } from "./surveys";  
export { jobSchemas } from "./jobs";

// Re-export everything as a combined schemas object for convenience
export const allSchemas = {
  ...require("./auth").authSchemas,
  ...require("./surveys").surveySchemas, 
  ...require("./jobs").jobSchemas,
}; 