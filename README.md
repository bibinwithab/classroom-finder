# 🏫 Classroom Finder

A real-time classroom occupancy tracking system built with React, TypeScript, Tailwind CSS, and Firebase Realtime Database.

## 📋 Features

- **Real-time Status**: View classroom occupancy across 3 floors (30 rooms total)
- **Student Tracking**: Students can mark their entry/exit to update occupancy count
- **Faculty Scheduling**: Faculty can schedule upcoming classes with subject, faculty name, and time
- **Floor Organization**: Rooms organized by floors (A101-A110, A201-A210, A301-A310)
- **Search Functionality**: Quick search to find any classroom
- **Beautiful UI**: White primary with purple accents, fully rounded design
- **Access Control**: Faculty access via access code (FACULTY2024)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (free tier)

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd classroom-finder
```

2. Install dependencies

```bash
npm install
```

3. Initialize Firebase Database

```bash
npm run init-firebase
```

This will create all 30 classrooms in your Firebase Realtime Database.

4. Start development server

```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## 🎯 Usage

### For Students

1. Visit the dashboard to see all classroom status
2. Click on any room or scan QR code to open room page
3. Click "Enter" when entering a room
4. Click "Exit" when leaving a room

### For Faculty

1. Navigate to any room page
2. Enter access code: `FACULTY2024`
3. Click "Schedule Class" button
4. Fill in Subject, Faculty Name, and Time
5. Click "Schedule Class" to set upcoming session

## 📁 Project Structure

```
classroom-finder/
├── src/
│   ├── Dashboard.tsx        # Main dashboard with floor view
│   ├── RoomPage.tsx          # Individual room page
│   ├── firebase.js           # Firebase configuration
│   ├── main.tsx              # App entry point with routing
│   ├── index.css             # Tailwind CSS
│   └── init-firebase.js      # Firebase initialization script
├── public/                   # Static assets
├── package.json
└── README.md
```

## 🗄️ Database Structure

```json
{
  "classrooms": {
    "A101": {
      "currentStatus": "free" | "occupied",
      "occupancyCount": 0,
      "nextClass": "no_class" | "faculty_coming",
      "subject": "-",
      "faculty": "-",
      "nextClassTime": "-"
    }
  }
}
```

## 🎨 Color Scheme

- **Primary**: White/Gray-50 backgrounds
- **Accent**: Purple (#7C3AED, #8B5CF6)
- **Status Colors**:
  - 🟢 Green: Free
  - 🟡 Amber: Upcoming Class
  - 🔴 Red: Occupied

## 🔐 Access Control

- **Faculty Access Code**: `FACULTY2024`
- Update in `src/RoomPage.tsx` line 18 to change access code

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3
- **Database**: Firebase Realtime Database
- **Build Tool**: Vite
- **Routing**: React Router DOM

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run init-firebase` - Initialize Firebase with all classrooms

## 🔮 Future Enhancements

- [ ] QR code generation for each room
- [ ] IoT sensor integration for automatic occupancy
- [ ] Push notifications for upcoming classes
- [ ] Timetable integration
- [ ] Analytics dashboard

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 👥 Support

For issues or questions, please open an issue on GitHub.
