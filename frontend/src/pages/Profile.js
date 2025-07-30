import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update functionality
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please login to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="form-container">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <FaUser size={32} className="text-white" />
                </div>
                <h2 className="fw-bold">Profile</h2>
                <p className="text-muted">
                  {user.role === 'admin' ? 'Administrator Profile' : 'User Profile'}
                </p>
              </div>

              {user.role === 'admin' && (
                <Alert variant="info" className="mb-4">
                  <FaShieldAlt className="me-2" />
                  <strong>Administrator Account</strong> - You have full access to manage the hotel system.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-2" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPhone className="me-2" />
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Type</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.role === 'admin' ? 'Administrator' : 'Regular User'}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Member Since</Form.Label>
                      <Form.Control
                        type="text"
                        value={new Date(user.createdAt).toLocaleDateString()}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>User ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={user._id}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center gap-3 mt-4">
                  {!isEditing ? (
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        variant="success"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            phone: user.phone
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Form>

              {user.role === 'admin' && (
                <div className="mt-4 pt-4 border-top">
                  <h5>Admin Quick Actions</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button variant="outline-primary" href="/admin/dashboard">
                      Go to Admin Dashboard
                    </Button>
                    <Button variant="outline-secondary" href="/">
                      View Hotel Homepage
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 