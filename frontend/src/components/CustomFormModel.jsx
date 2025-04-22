import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function CustomFormModel({
  show,
  onHide,
  title,
  fields,
  onSubmit,
  defaultValues = {},
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initialData = fields.reduce((acc, field) => {
      acc[field.name] =
        defaultValues[field.name] ?? (field.type === "checkbox" ? false : "");
      return acc;
    }, {});
    setFormData(initialData);
    setErrors({});
  }, [fields, defaultValues, show]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach(({ name, required, label }) => {
      if (required && !formData[name]) {
        newErrors[name] = `${label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {fields.map(
            ({ name, label, type = "text", options = [], required }) => (
              <Form.Group className="mb-3" controlId={name} key={name}>
                <Form.Label>{label}</Form.Label>

                {type === "textarea" ? (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    isInvalid={!!errors[name]}
                    required={required}
                  />
                ) : type === "select" ? (
                  <Form.Select
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    isInvalid={!!errors[name]}
                    required={required}
                  >
                    <option value="">-- Select --</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                ) : type === "checkbox" ? (
                  <div className="form-check">
                    <Form.Check
                      type="checkbox"
                      name={name}
                      label={label}
                      checked={formData[name]}
                      onChange={handleInputChange}
                      isInvalid={!!errors[name]}
                    />
                  </div>
                ) : (
                  <Form.Control
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    isInvalid={!!errors[name]}
                    required={required}
                  />
                )}

                <Form.Control.Feedback type="invalid">
                  {errors[name]}
                </Form.Control.Feedback>
              </Form.Group>
            )
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CustomFormModel;
