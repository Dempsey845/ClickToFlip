import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { getUserData, changePassword } from "../handlers/apiHandler";
import ChangePasswordModal from "../components/ChangePasswordModel";

function SettingsPage({ darkMode, toggleDarkMode }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [userData, setUserData] = useState(getUserData());

  const fetchUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div
      className={
        darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"
      }
    >
      <Container className="py-5">
        <h1 className="text-center mb-4">Settings</h1>

        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Account Settings</Card.Title>
                <hr />

                <div className="mb-3">
                  <strong>Email:</strong> {userData?.email}
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Password</strong>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </Button>
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Username:</strong> TODO
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowUsernameModal(true)}
                  >
                    Edit Username
                  </Button>
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Theme:</strong>
                  </div>
                  <Form>
                    <Form.Check
                      type="switch"
                      id="theme-switch"
                      label={darkMode ? "Dark" : "Light"}
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                  </Form>
                </div>

                <div className="text-end">
                  <Button variant="danger">Delete Account</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Password Modal */}
        <ChangePasswordModal
          showPasswordModal={showPasswordModal}
          setShowPasswordModal={setShowPasswordModal}
        />

        {/* Username Modal */}
        <Modal
          show={showUsernameModal}
          onHide={() => setShowUsernameModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Username</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>New Username</Form.Label>
                <Form.Control type="text" placeholder="Enter new username" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowUsernameModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">Save Changes</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default SettingsPage;
