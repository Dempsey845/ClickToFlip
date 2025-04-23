// AddGPUForm.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import AutocompleteInput from "./AutocompleteInput";

function AddGPUForm({ show, onSubmit, onClose }) {
  const [selectedGPU, setSelectedGPU] = useState(null);
  const [error, setError] = useState("");

  const handleSelect = (gpu) => {
    setSelectedGPU(gpu);
    setError("");
  };

  const handleSubmit = () => {
    if (!selectedGPU) {
      setError("Please select a GPU.");
      return;
    }
    onSubmit(selectedGPU);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Select a GPU</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="gpuSelect" className="mb-3">
            <Form.Label>GPU</Form.Label>
            <AutocompleteInput type="GPU" onSelect={handleSelect} />
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add GPU
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddGPUForm;
