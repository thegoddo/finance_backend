export const getValidationMessage = (error) => {
  if (!error?.issues?.length) {
    return "Invalid request payload.";
  }

  return error.issues
    .map((issue) => {
      const path = issue.path?.length ? issue.path.join(".") : "field";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
};
