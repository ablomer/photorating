# Photo Rating App

A modern, feature-rich web application built with React and TypeScript for rating and organizing photos from ZIP archives. Perfect for photographers, content creators, and anyone who needs to evaluate and categorize large collections of images.

## ✨ Features

### Rating & Ranking Systems
- **Star Rating System**: Rate images on a 1-5 star scale with intuitive star interface
- **Advanced Ranking System**: Compare images head-to-head using an intelligent pairwise comparison algorithm
- **Smart Comparison Algorithm**: Minimizes the number of comparisons needed using merge-sort inspired techniques with transitivity optimization
- **Ranking Results**: Get complete rankings with detailed statistics and scores

### File Processing & Navigation
- **ZIP File Processing**: Upload and extract images directly from ZIP archives
- **Image Navigation**: Easy navigation through images with keyboard shortcuts
- **Drag & Drop**: Simple drag and drop interface for file uploads
- **Image Shuffling**: Option to randomize image order for unbiased evaluation

### Progress & Data Management
- **Progress Persistence**: Automatic saving and recovery of your rating/ranking progress
- **Session Recovery**: Resume interrupted ranking sessions with full state restoration
- **Notes & Annotations**: Add personal notes to each image for better organization
- **Results Export**: Download comprehensive rating results, rankings, and statistics
- **Multiple Modes**: Switch between rating and ranking modes based on your needs

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts**: Efficient navigation and interaction via keyboard
- **Progress Tracking**: Real-time progress indicators with estimated completion times
- **Visual Feedback**: Smooth animations and clear visual states for all interactions

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

### Mode Selection

Choose between two evaluation methods:
- **Rating Mode**: Assign 1-5 star ratings to individual images
- **Ranking Mode**: Compare images head-to-head to create a complete ranking

### Rating Mode Workflow

1. **Upload ZIP File**: Drag and drop a ZIP file containing images or click to browse
2. **Select Rating Mode**: Choose the star rating evaluation method
3. **Rate Images**: Use the star rating system to rate each image (1-5 stars)
4. **Add Notes**: Optionally add notes to any image for additional context
5. **Navigate**: Use arrow keys or click navigation buttons to move between images
6. **Save Progress**: Your progress is automatically saved and can be recovered
7. **Export Results**: Download your ratings and notes when finished

### Ranking Mode Workflow

1. **Upload ZIP File**: Drag and drop a ZIP file containing images or click to browse
2. **Select Ranking Mode**: Choose the pairwise comparison evaluation method
3. **Compare Images**: Choose which image you prefer in each head-to-head comparison
4. **Smart Algorithm**: The system minimizes comparisons using advanced algorithms and transitivity rules
5. **Track Progress**: Monitor your progress with real-time completion estimates
6. **View Rankings**: See the final ranked list with scores and detailed statistics
7. **Export Results**: Download complete ranking results and comparison data

### Keyboard Shortcuts

#### Rating Mode
- **Left Arrow**: Previous image
- **Right Arrow**: Next image
- **Space**: Next image
- **1-5**: Quick star rating
- **N**: Add/edit notes for current image

#### Ranking Mode
- **Left Arrow / A**: Choose left image in comparison
- **Right Arrow / D**: Choose right image in comparison
- **Space**: Choose right image in comparison
- **Escape**: Return to mode selection

### Advanced Features

- **Progress Recovery**: Automatically detects and offers to restore previous sessions for both rating and ranking modes
- **Session Validation**: Ensures data integrity and recovers from corrupted sessions
- **Transitivity Optimization**: Ranking algorithm infers relationships to minimize required comparisons
- **Inconsistency Detection**: Identifies circular preferences and provides suggestions
- **Detailed Statistics**: View comparison history, average times, and optimization metrics
- **Image Shuffling**: Option to randomize image order for unbiased evaluation
- **Auto-save**: Progress is automatically saved to prevent data loss
- **Session Management**: Multiple rating and ranking sessions can be managed independently

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with modern design principles
- **File Processing**: JSZip for ZIP archive handling
- **State Management**: React Hooks for local state
- **Algorithms**: Custom merge-sort inspired ranking algorithm with transitivity optimization
- **Data Persistence**: LocalStorage for session management and progress recovery
- **Development Tools**: ESLint, TypeScript compiler

## 🧮 Ranking Algorithm

The ranking system uses a sophisticated merge-sort inspired algorithm that:

- **Minimizes Comparisons**: Uses divide-and-conquer strategy to reduce the number of head-to-head comparisons needed
- **Applies Transitivity**: If A > B and B > C, automatically infers A > C to avoid redundant comparisons
- **Estimates Progress**: Provides accurate completion estimates using N×log₂(N) complexity analysis
- **Handles Inconsistencies**: Detects circular preferences and provides recovery suggestions
- **Optimizes Performance**: Typically requires ~80% fewer comparisons than naive pairwise comparison
- **Maintains State**: Full session recovery with validation and error correction

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
