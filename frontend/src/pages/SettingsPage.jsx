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
import { getUserData } from "../handlers/apiHandler";
import ChangePasswordModal from "../components/ChangePasswordModal";
import ChangeUsernameModel from "../components/ChangeUsernameModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import LoadingScreen from "../components/LoadingScreen";
import CurrencySelector from "../components/CurrencySelector";

//const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function SettingsPage({ darkMode, toggleDarkMode }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(getUserData());

  const fetchUserData = async () => {
    setLoading(true);
    //await delay(2000);
    const data = await getUserData();
    setUserData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div style={{ position: "relative" }}>
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
                      <strong>Username:</strong> {userData?.user_name}
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowUsernameModal(true)}
                    >
                      Edit Username
                    </Button>
                  </div>

                  {!loading && <CurrencySelector userId={userData.id} />}

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
                    <Button
                      variant="danger"
                      onClick={() => {
                        setShowDeleteAccountModal(true);
                      }}
                    >
                      Delete Account
                    </Button>
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
          <ChangeUsernameModel
            showUsernameModal={showUsernameModal}
            setShowUsernameModal={setShowUsernameModal}
            onSave={(newUsername) => {
              setUserData((prev) => {
                return { ...prev, user_name: newUsername };
              });
            }}
          />

          {/* Delete Account Modal */}
          <DeleteAccountModal
            showDeleteAccountModal={showDeleteAccountModal}
            setShowDeleteAccountModal={setShowDeleteAccountModal}
          />
        </Container>
      </div>
      {loading && (
        <LoadingScreen fullscreen={false} overlay={true} darkMode={darkMode} />
      )}
    </div>
  );
}

export default SettingsPage;
