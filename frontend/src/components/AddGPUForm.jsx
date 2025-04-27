import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import AutocompleteInput from "./AutocompleteInput";

function AddGPUForm({ show, onSubmit, onClose, darkMode = false }) {
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
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName={darkMode ? "dark-modal" : ""}
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ color: darkMode ? "#fff" : "#000" }}>
          Select a GPU
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          backgroundColor: darkMode ? "#333" : "#fff", // Modal background color
          color: darkMode ? "#fff" : "#000", // Text color
        }}
      >
        <Form>
          <Form.Group controlId="gpuSelect" className="mb-3">
            <Form.Label style={{ color: darkMode ? "#fff" : "#000" }}>
              GPU
            </Form.Label>
            <AutocompleteInput type="GPU" onSelect={handleSelect} />
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer
        style={{
          backgroundColor: darkMode ? "#444" : "#f8f9fa", // Footer background
        }}
      >
        <Button
          variant="secondary"
          onClick={onClose}
          style={{
            backgroundColor: darkMode ? "#555" : "#6c757d", // Button color
            borderColor: darkMode ? "#444" : "#ccc",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          style={{
            backgroundColor: darkMode ? "#0056b3" : "#007bff", // Button color
            borderColor: darkMode ? "#444" : "#007bff", // Button border color
          }}
        >
          Add GPU
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddGPUForm;
