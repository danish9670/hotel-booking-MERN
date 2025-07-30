# Hotel Booking Management System

A complete full-stack Hotel Booking Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with Bootstrap for responsive design.

## Features

### 👤 User Panel (Customer Side)
- User registration and login with JWT authentication
- Browse available rooms with images, prices, and descriptions
- Room booking with check-in/check-out date selection
- User dashboard to view booking history and status
- Cancel future bookings

### 🛠 Admin Panel
- Admin login system with JWT authentication
- Dashboard with booking overview and management
- Accept/Reject booking requests
- CRUD operations for rooms (Add/Edit/Delete)
- Mark rooms as unavailable

### 💡 Technical Features
- Responsive design using Bootstrap
- JWT authentication for both users and admins
- Form validation (frontend and backend)
- Toast notifications for user feedback
- Search and filter functionality
- Pagination for room listings

## Tech Stack

- **Frontend**: React.js, Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Styling**: Bootstrap 5

## Project Structure

```
hotel-booking-management-system/
├── frontend/          # React.js application
├── backend/           # Node.js/Express.js API
├── package.json       # Root package.json
└── README.md         # This file
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel-booking-management-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hotel-booking
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/admin` - Get all bookings (Admin only)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status (Admin only)
- `DELETE /api/bookings/:id` - Cancel booking

## Sample Data

The application includes sample rooms and admin credentials for testing:

**Admin Login:**
- Email: admin@hotel.com
- Password: admin123

**Sample Rooms:**
- Various room types with different prices and amenities
- Images and descriptions included

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 