# 🧬 Cognito AI Pharmaceutical Intelligence Frontend

A modern, professional React frontend for the Cognito AI Pharmaceutical Intelligence Platform. This application provides an intuitive interface for drug analysis, company intelligence, and AI-powered pharmaceutical research.

## ✨ Features

### 🎨 Modern UI/UX
- **Professional Design**: Clean, modern interface with gradient themes and smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Material-UI Components**: Built with Material-UI v5 for consistent design language
- **Dark/Light Theme Support**: Customizable theme system
- **Smooth Animations**: CSS transitions and hover effects for enhanced user experience

### 🔍 Core Functionality
- **Drug Intelligence Search**: Comprehensive pharmaceutical analysis with 4 analysis types
  - Comprehensive Analysis
  - Market Analysis
  - Formulation Analysis
  - PK/PD Analysis
- **Company Intelligence**: Deep dive into pharmaceutical companies and portfolios
- **AI-Powered Insights**: GPT-4o enhanced search with LangChain validation
- **Data Management**: MongoDB-powered storage with report management

### 🚀 Technical Features
- **React 18**: Latest React features with hooks and functional components
- **React Router v6**: Client-side routing with lazy loading
- **Material-UI v5**: Professional component library
- **Axios**: HTTP client for API communication
- **Error Boundaries**: Graceful error handling
- **Loading States**: Professional loading indicators
- **Responsive Design**: Mobile-first approach

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build files will be created in the `build` folder.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation header
│   ├── ErrorBoundary.js # Error handling
│   └── LoadingSpinner.js # Loading indicators
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── DrugSearch.js   # Drug analysis page
│   ├── CompanySearch.js # Company analysis page
│   ├── Reports.js      # Reports management
│   └── APIInfo.js      # API documentation
├── services/           # API services
│   └── api.js         # API client configuration
├── App.js             # Main app component
├── index.js           # App entry point
└── index.css          # Global styles
```

## 🎯 Key Components

### Dashboard
- **API Status Monitoring**: Real-time backend health checks
- **Feature Cards**: Quick access to main functionalities
- **Quick Actions**: One-click navigation to key features
- **System Information**: API version and capabilities display

### Drug Search
- **Multi-Analysis Support**: 4 different analysis types
- **Real-time Search**: Instant results with loading states
- **Copy to Clipboard**: Easy content sharing
- **Report Management**: Save and retrieve analysis reports

### Header Navigation
- **Sticky Navigation**: Always accessible navigation bar
- **Active State Indicators**: Clear current page indication
- **Responsive Design**: Mobile-friendly navigation
- **Brand Identity**: Professional logo and branding

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Main brand color
- **Secondary**: Purple (#7c3aed) - Accent color
- **Success**: Green (#10b981) - Success states
- **Warning**: Orange (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately on different screen sizes

### Components
- **Cards**: Elevated with subtle shadows and hover effects
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Clean, accessible form controls
- **Alerts**: Contextual feedback with appropriate colors

## 🔧 Configuration

### API Configuration
The frontend is configured to connect to the backend API at `http://localhost:8000`. You can modify this in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Theme Customization
The theme can be customized in `src/App.js`. The theme object includes:
- Color palette
- Typography settings
- Component overrides
- Shape configurations

## 🚀 Performance Optimizations

- **Lazy Loading**: Pages are loaded on-demand using React.lazy()
- **Code Splitting**: Automatic code splitting for better performance
- **Optimized Images**: WebP format support
- **Minified CSS**: Production builds include minified styles
- **Tree Shaking**: Unused code is automatically removed

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: 1200px+ (Full feature set)
- **Tablet**: 768px - 1199px (Adapted layout)
- **Mobile**: <768px (Mobile-optimized navigation)

## 🔒 Security Features

- **Error Boundaries**: Graceful error handling
- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized content rendering
- **CORS Handling**: Proper cross-origin request handling

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (irreversible)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill the process using port 3000
   npx kill-port 3000
   ```

2. **API connection issues**
   - Ensure the backend is running on `http://localhost:8000`
   - Check CORS configuration in the backend
   - Verify network connectivity

3. **Build errors**
   ```bash
   # Clear cache and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Getting Help

- Check the browser console for error messages
- Verify all dependencies are installed correctly
- Ensure Node.js version is compatible (v16+)
- Check the backend API status

## 🔮 Future Enhancements

- [ ] Dark mode toggle
- [ ] Advanced filtering options
- [ ] Export functionality (PDF, Excel)
- [ ] Real-time notifications
- [ ] User authentication
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode support

---

**Built with ❤️ using React, Material-UI, and modern web technologies**
