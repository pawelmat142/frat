import React from "react";

interface FormErrorProps {
  error?: { message?: string } | null;
}

const FormError: React.FC<FormErrorProps> = ({ error }) =>
  error?.message ? (
    <span className="form-control-error-msg">{error.message}</span>
  ) : null;

export default FormError;
