# Photo Rating App

A modern, feature-rich web application built with React and TypeScript for rating and organizing photos from ZIP archives. Perfect for photographers, content creators, and anyone who needs to evaluate and categorize large collections of images.

## ✨ Features

- **ZIP File Processing**: Upload and extract images directly from ZIP archives
- **Star Rating System**: Rate images on a 1-5 star scale with intuitive star interface
- **Progress Persistence**: Automatic saving and recovery of your rating progress
- **Image Navigation**: Easy navigation through images with keyboard shortcuts
- **Notes & Annotations**: Add personal notes to each image for better organization
- **Results Export**: Download comprehensive rating results and statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Drag & Drop**: Simple drag and drop interface for file uploads

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd photorating
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist/` directory.

## 🎯 Usage

### Basic Workflow

1. **Upload ZIP File**: Drag and drop a ZIP file containing images or click to browse
2. **Rate Images**: Use the star rating system to rate each image (1-5 stars)
3. **Add Notes**: Optionally add notes to any image for additional context
4. **Navigate**: Use arrow keys or click navigation buttons to move between images
5. **Save Progress**: Your progress is automatically saved and can be recovered
6. **Export Results**: Download your ratings and notes when finished

### Keyboard Shortcuts

- **Left Arrow**: Previous image
- **Right Arrow**: Next image
- **Space**: Next image
- **1-5**: Quick star rating
- **N**: Add/edit notes for current image

### Features

- **Progress Recovery**: Automatically detects and offers to restore previous sessions
- **Image Shuffling**: Option to randomize image order for unbiased rating
- **Auto-save**: Progress is automatically saved to prevent data loss
- **Session Management**: Multiple rating sessions can be managed independently

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with modern design principles
- **File Processing**: JSZip for ZIP archive handling
- **State Management**: React Hooks for local state
- **Development Tools**: ESLint, TypeScript compiler

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information about your problem
3. Include browser version, operating system, and steps to reproduce
