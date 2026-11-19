import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModel from "../models/AuthModel";

function useLoginController(onLoginSuccess) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(AuthModel.emptyState());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  }, []);

  const togglePasswordVisibility = useCallback(() => setShowPassword((value) => !value), []);

  const submit = useCallback(async (event) => {
    event.preventDefault();
    const errors = AuthModel.validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStatus("loading");
    setFormError(null);
    try {
      const data = await AuthModel.authenticate(formData);
      const userWithEmail = { ...data, email: data.email || formData.email };
      localStorage.setItem("helpticket_token", data.token);
      localStorage.setItem("helpticket_user", JSON.stringify(userWithEmail));
      setStatus("success");
      onLoginSuccess?.(userWithEmail);
      navigate("/app/inicio");
    } catch (error) {
      setFormError(error.message);
      setStatus("idle");
    }
  }, [formData, onLoginSuccess, navigate]);

  return { formData, fieldErrors, formError, showPassword, status, updateField, togglePasswordVisibility, submit };
}

export default useLoginController;
