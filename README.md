# Waitlist Flow

A modern, mobile-first waitlist application built with React, TypeScript, and Tailwind CSS.

## Features

- **Mobile-First Design**: Optimized for touch interactions and mobile devices
- **Form Validation**: Real-time validation with error messages
- **Success Toast**: Animated success notification that auto-dismisses after 2 seconds
- **Smooth Animations**: 300ms transitions for all interactions
- **Accessible**: WCAG 2.1 AA compliant components

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Modern CSS with custom properties

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Button.tsx          # Reusable button component
│   ├── Input.tsx            # Form input component
│   ├── Toast.tsx            # Toast notification component
│   └── WaitlistModal.tsx    # Main waitlist form component
├── screens/
│   └── WaitlistScreen.tsx   # Waitlist screen container
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## Components

### WaitlistModal

The main waitlist form component with:
- First name, last name, and email inputs
- Form validation
- Success state with reset functionality
- Integration with Toast component

### Toast

A reusable toast notification component that:
- Animates in from the top
- Auto-dismisses after 2 seconds
- Supports success, error, and info types
- Mobile-optimized positioning

## Design System

The project follows mobile-first design principles with:
- 20-24px screen edge padding
- 8px base spacing unit
- 44x44px minimum touch targets
- 48-56px button heights
- 300ms standard animation duration

## License

Private project
