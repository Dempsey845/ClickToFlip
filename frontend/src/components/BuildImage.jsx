import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const isProduction = process.env.NODE_ENV === "production";

function BuildImage({ localBuild, darkMode }) {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <div className="d-flex justify-content-center my-3">
        {localBuild?.image_url ? (
          <img
            src={
              isProduction
                ? localBuild.image_url
                : `${BACKEND_URL}${localBuild.image_url}`
            }
            alt="Build"
            className="img-fluid rounded shadow border"
            style={{
              maxHeight: "400px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={handleOpen}
            title="Click to enlarge"
          />
        ) : (
          <div
            className={`d-flex align-items-center justify-content-center text-center text-white rounded shadow border ${
              darkMode ? "bg-dark" : "bg-secondary"
            }`}
            style={{ height: "400px", width: "100%", maxWidth: "400px" }}
          >
            <span className="fw-semibold fs-5">No image available</span>
          </div>
        )}
      </div>

      {/* Modal for enlarged image */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        size="lg"
        contentClassName={darkMode ? "bg-dark text-light" : ""}
        backdropClassName={darkMode ? "custom-dark-backdrop" : ""}
      >
        <Modal.Header
          closeButton
          className={darkMode ? "bg-dark text-light" : ""}
        >
          <Modal.Title>Preview Build Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={
              isProduction
                ? localBuild.image_url
                : `${BACKEND_URL}${localBuild.image_url}`
            }
            alt="Build Large"
            className="img-fluid rounded shadow"
            style={{ maxHeight: "80vh", objectFit: "contain" }}
          />
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark text-light" : ""}>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BuildImage;
