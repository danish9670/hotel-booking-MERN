import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Spinner, Alert, Modal, Form, Pagination, Nav, Tab 
} from 'react-bootstrap';
import { 
  FaCalendarAlt, FaUsers, FaDollarSign, FaCheck, FaTimes, 
  FaPlus, FaEdit, FaTrash, FaBed, FaEye 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const initialRoomState = {
  title: '',
  description: '',
  price: '',
  type: 'Single',
  capacity: 1,
  amenities: [],
  images: [''],
  floor: 1,
  roomNumber: '',
  isAvailable: true
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState(initialRoomState);
  const [roomFormLoading, setRoomFormLoading] = useState(false);
  const [roomFormError, setRoomFormError] = useState('');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'rooms') {
      fetchRooms();
    }
  }, [activeTab, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/bookings/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/admin?page=${currentPage}&limit=10`);
      setBookings(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms');
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedBooking) return;

    setStatusLoading(true);
    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, {
        status,
        adminNotes
      });
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      setShowStatusModal(false);
      setSelectedBooking(null);
      setAdminNotes('');
      fetchBookings();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update booking status';
      toast.error(message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRoomAvailability = async (roomId, currentStatus) => {
    try {
      await api.put(`/rooms/${roomId}/availability`);
      toast.success(`Room ${currentStatus ? 'marked as unavailable' : 'marked as available'}`);
      fetchRooms();
    } catch (error) {
      toast.error('Failed to update room availability');
    }
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setRoomForm(initialRoomState);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ ...room, images: room.images || [''], amenities: room.amenities || [] });
    setShowRoomModal(true);
  };

  const handleRoomFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'amenities') {
      const amenities = [...roomForm.amenities];
      if (checked) {
        amenities.push(value);
      } else {
        const idx = amenities.indexOf(value);
        if (idx > -1) amenities.splice(idx, 1);
      }
      setRoomForm({ ...roomForm, amenities });
    } else if (name === 'images') {
      setRoomForm({ ...roomForm, images: value.split(',').map((img) => img.trim()) });
    } else if (type === 'checkbox') {
      setRoomForm({ ...roomForm, [name]: checked });
    } else {
      setRoomForm({ ...roomForm, [name]: value });
    }
  };

  const handleRoomFormSubmit = async (e) => {
    e.preventDefault();
    setRoomFormLoading(true);
    setRoomFormError('');
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, roomForm);
        toast.success('Room updated successfully');
      } else {
        await api.post('/rooms', roomForm);
        toast.success('Room added successfully');
      }
      setShowRoomModal(false);
      fetchRooms();
    } catch (error) {
      setRoomFormError(error.response?.data?.message || 'Failed to save room');
    } finally {
      setRoomFormLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'warning', text: 'dark' },
      'Approved': { bg: 'success', text: 'white' },
      'Rejected': { bg: 'danger', text: 'white' },
      'Cancelled': { bg: 'secondary', text: 'white' }
    };

    const config = statusConfig[status] || { bg: 'light', text: 'dark' };
    return <Badge bg={config.bg} text={config.text}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && activeTab !== 'overview') {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Admin Dashboard</h1>
          <p className="text-muted">
            Welcome back, {user?.name}! Manage bookings, rooms, and monitor hotel operations.
          </p>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'rooms'} 
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Row>
          <Col md={3} className="mb-3">
            <Card className="dashboard-card text-center">
              <Card.Body>
                <FaCalendarAlt className="text-primary mb-2" size={24} />
                <h4>{stats.totalBookings || 0}</h4>
                <p className="text-muted mb-0">Total Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="dashboard-card text-center">
              <Card.Body>
                <Badge bg="warning" text="dark" className="mb-2">
                  Pending
                </Badge>
                <h4>{stats.pendingBookings || 0}</h4>
                <p className="text-muted mb-0">Pending Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="dashboard-card text-center">
              <Card.Body>
                <Badge bg="success" className="mb-2">
                  Approved
                </Badge>
                <h4>{stats.approvedBookings || 0}</h4>
                <p className="text-muted mb-0">Approved Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="dashboard-card text-center">
              <Card.Body>
                <FaDollarSign className="text-success mb-2" size={24} />
                <h4>${(stats.totalRevenue || 0).toFixed(2)}</h4>
                <p className="text-muted mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">All Bookings</h5>
          </Card.Header>
          <Card.Body>
            {bookings.length === 0 ? (
              <Alert variant="info">
                No bookings found.
              </Alert>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Guests</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <div>
                            <strong>{booking.user.name}</strong>
                            <br />
                            <small className="text-muted">
                              {booking.user.email}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{booking.room.title}</strong>
                            <br />
                            <small className="text-muted">
                              Room {booking.room.roomNumber}
                            </small>
                          </div>
                        </td>
                        <td>{formatDate(booking.checkIn)}</td>
                        <td>{formatDate(booking.checkOut)}</td>
                        <td>
                          <FaUsers className="me-1" />
                          {booking.guests}
                        </td>
                        <td>
                          <strong>${booking.totalAmount}</strong>
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {booking.status === 'Pending' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowStatusModal(true);
                                  }}
                                >
                                  <FaCheck className="me-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowStatusModal(true);
                                  }}
                                >
                                  <FaTimes className="me-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Rooms</h5>
            <Button variant="primary" size="sm" onClick={handleAddRoom}>
              <FaPlus className="me-1" />
              Add Room
            </Button>
          </Card.Header>
          <Card.Body>
            {rooms.length === 0 ? (
              <Alert variant="info">
                No rooms found.
              </Alert>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room._id}>
                        <td>
                          <div>
                            <strong>{room.title}</strong>
                            <br />
                            <small className="text-muted">
                              Room {room.roomNumber}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{room.type}</Badge>
                        </td>
                        <td>
                          <strong>${room.price}</strong>
                        </td>
                        <td>
                          <FaUsers className="me-1" />
                          {room.capacity}
                        </td>
                        <td>
                          {room.isAvailable ? (
                            <Badge bg="success">Available</Badge>
                          ) : (
                            <Badge bg="danger">Unavailable</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditRoom(room)}
                            >
                              <FaEdit className="me-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleRoomAvailability(room._id, room.isAvailable)}
                            >
                              <FaBed className="me-1" />
                              {room.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Booking Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <p>Update status for booking:</p>
              <div className="bg-light p-3 rounded mb-3">
                <strong>{selectedBooking.user.name}</strong> - {selectedBooking.room.title}
                <br />
                <small className="text-muted">
                  {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
                </small>
              </div>
              <Form.Group>
                <Form.Label>Admin Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this booking..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => handleStatusUpdate('Approved')}
            disabled={statusLoading}
          >
            {statusLoading ? 'Updating...' : 'Approve'}
          </Button>
          <Button
            variant="danger"
            onClick={() => handleStatusUpdate('Rejected')}
            disabled={statusLoading}
          >
            {statusLoading ? 'Updating...' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Room Form Modal */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Edit Room' : 'Add Room'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRoomFormSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control name="title" value={roomForm.title} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" value={roomForm.description} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" name="price" value={roomForm.price} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={roomForm.type} onChange={handleRoomFormChange} required>
                <option>Single</option>
                <option>Double</option>
                <option>Suite</option>
                <option>Deluxe</option>
                <option>Presidential</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Capacity</Form.Label>
              <Form.Control type="number" name="capacity" value={roomForm.capacity} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Amenities</Form.Label><br />
              {['WiFi', 'TV', 'AC', 'Mini Bar', 'Room Service', 'Balcony', 'Ocean View', 'Mountain View', 'Kitchen', 'Jacuzzi'].map((amenity) => (
                <Form.Check
                  inline
                  key={amenity}
                  label={amenity}
                  name="amenities"
                  value={amenity}
                  checked={roomForm.amenities.includes(amenity)}
                  onChange={handleRoomFormChange}
                />
              ))}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Images (comma separated URLs)</Form.Label>
              <Form.Control name="images" value={roomForm.images.join(', ')} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Floor</Form.Label>
              <Form.Control type="number" name="floor" value={roomForm.floor} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Room Number</Form.Label>
              <Form.Control name="roomNumber" value={roomForm.roomNumber} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check type="checkbox" name="isAvailable" label="Available" checked={roomForm.isAvailable} onChange={handleRoomFormChange} />
            </Form.Group>
            {roomFormError && <Alert variant="danger">{roomFormError}</Alert>}
            <Button type="submit" variant="primary" disabled={roomFormLoading} className="w-100">
              {roomFormLoading ? 'Saving...' : (editingRoom ? 'Update Room' : 'Add Room')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard; 