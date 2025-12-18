# Recipe Notebook Frontend

React-based frontend for the Recipe Notebook application.

## Setup

1. Install Node.js (v18 or higher)
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build

Build for production:
```bash
npm run build
```

## Features

- User registration with validation
- Character counter for username input
- Password visibility toggle
- Real-time form validation
- Toast notifications
- Responsive design
- Accessibility features (ARIA labels, keyboard navigation)

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Button.jsx
│   ├── FormInput.jsx
│   └── RegistrationForm.jsx
├── views/           # Page-level components
│   └── RegistrationView.jsx
├── hooks/           # Custom React hooks
│   └── useRegistration.js
├── services/        # API services
│   └── api.js
├── types/           # Type definitions (for reference)
│   └── auth.js
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```
