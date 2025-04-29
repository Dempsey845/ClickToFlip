import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { deleteAccount } from "../handlers/apiHandler";
import { useNavigate } from "react-router-dom";

function DeleteAccountModal({
  showDeleteAccountModal,
  setShowDeleteAccountModal,
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSaveChanges = async () => {
    setLoading(true); // start loading

    try {
      const deleted = await deleteAccount();
      setShowDeleteAccountModal(false);
      deleted && navigate("/signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={showDeleteAccountModal}
      onHide={() => setShowDeleteAccountModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete Account?</Modal.Title>
      </Modal.Header>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowDeleteAccountModal(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button variant="danger" onClick={handleSaveChanges} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Deleting...
            </>
          ) : (
            "Delete Account"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteAccountModal;
