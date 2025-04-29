import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { changeUsername } from "../handlers/apiHandler";
import { toast } from "react-toastify";

function ChangeUsernameModel({
  showUsernameModal,
  setShowUsernameModal,
  onSave,
}) {
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (newUsername.length < 5) {
      toast.error("Username must be atleast 5 characters");
      return;
    }

    setLoading(true); // start loading

    try {
      await changeUsername(newUsername);
      setShowUsernameModal(false);
      onSave(newUsername);
      setNewUsername("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={showUsernameModal} onHide={() => setShowUsernameModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Change Username</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>New Username</Form.Label>
            <Form.Control
              type="username"
              placeholder="Enter new Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={loading} // disable while loading
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowUsernameModal(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChangeUsernameModel;
