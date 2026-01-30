# Raktadan Backend

A comprehensive blood donation management system backend built with Node.js, Express, and MySQL for Nepal.

## Features

- **Multi-Role User System**: SUPER_ADMIN, HOSPITAL_ADMIN, BLOOD_BANK_STAFF, DONOR, RECIPIENT
- **Role Toggle**: Users can switch between DONOR and RECIPIENT roles
- **Blood Requests**: Create, search, and respond to blood donation requests
- **Donation Impact Notifications**: Real-time notifications when blood saves lives
- **Donation Camps**: Organize and manage blood donation camps
- **Ambulance Services**: Emergency ambulance coordination
- **Hospital Management**: Hospital and blood bank administration
- **Emergency Response**: Critical blood and ambulance services
- **Real-time Search**: Find blood donors and requests by location and blood group
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation using Joi

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (ES2020+)
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcrypt
- **Validation**: Joi
- **Rate Limiting**: express-rate-limit
- **Notifications**: Firebase Admin SDK, Nodemailer
- **PDF Generation**: PDFKit for donor cards

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (optional, for caching)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd raktadan-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the `.env` file and update the configuration:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/raktadan
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3001
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   Ensure MongoDB is running on your system. The application will automatically connect to the database specified in `MONGODB_URI`.

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot reload enabled.

### Production Mode

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Blood Requests

- `POST /api/blood-requests` - Create a blood request (protected)
- `GET /api/blood-requests` - Get blood requests (protected, paginated)
- `GET /api/blood-requests/search` - Search blood requests (protected)
- `POST /api/blood-requests/:requestId/respond` - Respond to blood request (protected)
- `PUT /api/blood-requests/:requestId/status` - Update request status (admin/hospital only)

### Donation Camps

- `POST /api/donation-camps` - Create donation camp (admin/hospital only)
- `GET /api/donation-camps` - Get donation camps (public, paginated)
- `GET /api/donation-camps/:campId` - Get specific donation camp (public)
- `POST /api/donation-camps/:campId/register` - Register for camp (protected)
- `PUT /api/donation-camps/:campId` - Update camp (admin/hospital only)
- `DELETE /api/donation-camps/:campId` - Delete camp (admin only)

### Health Check

- `GET /api/health` - Check API health status

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "Success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "Error",
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Data Models

### User
- Personal information (name, email, phone)
- Blood group and medical details
- Address and location
- Emergency contact information
- Role-based permissions (user, admin, hospital)

### Blood Request
- Patient information
- Blood requirements
- Hospital details
- Urgency level
- Status tracking
- Donor responses

### Donation Camp
- Camp details and schedule
- Organizer information
- Location and facilities
- Registration management
- Participation tracking

## Security Features

- **Password Hashing**: Using bcryptjs with configurable salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet**: Security headers configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/raktadan |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | Token expiration time | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `FRONTEND_URL` | Allowed CORS origin | http://localhost:3001 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run build:watch` - Build with watch mode
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For any issues or questions, please create an issue in the repository or contact the development team.
