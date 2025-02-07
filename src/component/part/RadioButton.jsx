import { forwardRef, useState, useImperativeHandle } from "react";

const RadioButton = forwardRef(function RadioButton(
  {
    arrData = [],
    label = "",
    name,
    isRequired = false,
    isDisabled = false,
    hideLabel = false, // Properti baru
    errorMessage,
    showLabel = true,
    value,
    onChange,
    ...props
  },
  ref
) {
  const [error, setError] = useState(false);

  // Expose reset, validate, and get value methods to the parent
  useImperativeHandle(ref, () => ({
    reset() {
      setError(false);
    },
    validate() {
      if (isRequired && !value) {
        setError(true);
        return false;
      }
      setError(false);
      return true;
    },
    get value() {
      return value;
    },
  }));

  const handleChange = (e) => {
    onChange(e);
    if (isRequired) {
      setError(!e.target.value);
    }
  };

  return (
    <div className="mb-3">
      {!hideLabel &&
        showLabel && ( // Hanya tampil jika `hideLabel` false
          <label className="form-label fw-bold">
            {label}
            {isRequired ? <span className="text-danger"> *</span> : ""}
            {errorMessage ? (
              <span className="fw-normal text-danger"> {errorMessage}</span>
            ) : (
              ""
            )}
          </label>
        )}
      <div className="row">
        {arrData.map((data, index) => (
          <div className="col-6" key={data.Value}>
            <div className="form-check">
              <input
                className={`form-check-input ${error ? "is-invalid" : ""}`}
                type="radio"
                id={`${name}-${data.Value}`}
                name={name}
                value={data.Value}
                checked={value === data.Value}
                onChange={handleChange}
                disabled={isDisabled}
                {...props}
              />
              <label
                className="form-check-label"
                htmlFor={`${name}-${data.Value}`}
              >
                {data.Text}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default RadioButton;
