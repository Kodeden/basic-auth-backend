export const generateValidationErrorMessage = (validationErrors) => {
  return validationErrors
    .map(
      (error) => `
      ${error.msg}.
      '${error.path}' had a value of '${error.value}.' 🥅
    `
    )
    .join();
};
