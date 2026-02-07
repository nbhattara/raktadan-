# Raktadan Backend

🩸 **A comprehensive blood donation platform backend API serving Nepal's healthcare community**

## 🚀 **Production-Ready Features**

### ✅ **Complete API Endpoints**
- **🔐 Authentication** - JWT-based with OTP verification
- **👥 User Management** - Donors, recipients, hospital admins
- **🏥 Hospital Directory** - Search and manage hospitals
- **🚑 Ambulance Services** - Emergency medical transport
- **🩸 Blood Requests** - Real-time blood requirement tracking
- **🏕️ Donation Camps** - Community blood drive management
- **📊 Inventory Tracking** - Blood stock monitoring
- **📈 Analytics Dashboard** - Comprehensive statistics
- **📍 District Coverage** - All 77 districts of Nepal

### 🛡️ **Security Features**
- JWT authentication with refresh tokens
- OTP-based registration system
- Rate limiting and request throttling
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- SQL injection prevention
- XSS protection

### 📱 **Frontend Integration**
- Complete SPA frontend included
- Real-time search functionality
- Responsive design for all devices
- Progressive Web App features
- Offline functionality

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd raktadan-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Database setup
npx prisma migrate dev
npx prisma generate

# Seed sample data (optional)
npm run seed:all

# Start development server
npm run dev

# Start production server
npm run prod
```

### **Environment Variables**
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/raktadan"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=production

# Email (for OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Firebase (optional)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
```

## 📊 **Available Scripts**

```bash
# Development
npm run dev          # Start with nodemon
npm run start        # Start production server

# Database
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:deploy    # Deploy migrations to production

# Data Seeding
npm run seed:hospitals   # Seed hospital data
npm run seed:ambulances  # Seed ambulance data
npm run seed:camps      # Seed donation camps
npm run seed:all        # Seed all sample data

# Quality Assurance
npm run test           # Run tests with coverage
npm run lint           # Check code quality
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier

# Production
npm run build          # Build for production
npm run prod           # Start in production mode
npm run clean          # Clean and reinstall dependencies
```

## 🔌 **API Documentation**

### **Base URL**
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### **Authentication**
```bash
# Login
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "9841234567"
}

# OTP Verification
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "1234"
}
```

### **Key Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/users/profile` | GET/PUT | User profile management |
| `/donors` | POST/GET | Donor registration & search |
| `/hospitals` | GET | Hospital directory |
| `/ambulances` | GET | Ambulance services |
| `/blood-requests` | POST/GET | Blood request management |
| `/donation-camps` | GET | Donation camp listings |
| `/inventory` | GET | Blood inventory status |
| `/stats/dashboard` | GET | Dashboard statistics |

## 🏗️ **Project Structure**

```
raktadan-backend/
├── src/
│   ├── controllers/        # API controllers
│   ├── middleware/         # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── seed/              # Database seeding
│   ├── config/            # Configuration files
│   └── app.js             # Application entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── public/
│   ├── index.html         # Frontend SPA
│   ├── style.css          # Frontend styles
│   └── script.js          # Frontend logic
└── docs/                  # Documentation
```

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 **Deployment**

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker Deployment**
```bash
# Build image
docker build -t raktadan-backend .

# Run container
docker run -p 3000:3000 raktadan-backend
```

### **Heroku Deployment**
```bash
# Create Heroku app
heroku create raktadan-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your-production-db-url

# Deploy
git push heroku main
```

## 📈 **Performance & Monitoring**

- **Winston Logging** - Structured logging with multiple levels
- **Rate Limiting** - Prevent API abuse
- **Health Checks** - `/api/health` endpoint
- **Metrics** - Request/response time tracking
- **Error Handling** - Comprehensive error management

## 🔒 **Security Considerations**

- All passwords are hashed with bcrypt
- JWT tokens have expiration
- Input validation on all endpoints
- SQL injection prevention with Prisma ORM
- CORS configured for production domains
- Security headers with Helmet

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:
- 📧 Email: support@raktadan.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/raktadan-backend/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/raktadan-backend/wiki)

## 🙏 **Acknowledgments**

- Nepal Red Cross Society for blood donation guidelines
- All healthcare workers serving in Nepal
- Open source community for amazing tools and libraries

---

**🩸 Made with ❤️ for Nepal's Healthcare Community** team.
