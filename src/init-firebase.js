// Script to initialize Firebase with all 30 classrooms
// Run this once to set up the database structure
// Usage: node src/init-firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDwqZpdim8WcdDNBwoTAMWvXhEQ4d8XJ6Y",
  authDomain: "test-1b36a.firebaseapp.com",
  databaseURL: "https://test-1b36a-default-rtdb.firebaseio.com",
  projectId: "test-1b36a",
  storageBucket: "test-1b36a.firebasestorage.app",
  messagingSenderId: "565146164069",
  appId: "1:565146164069:web:a71c2e155f0e7869e31f8c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Generate all 30 room IDs
const generateRooms = () => {
  const rooms = {};
  
  // Floor 1: A101-A110
  for (let i = 1; i <= 10; i++) {
    const roomId = `A10${i}`;
    rooms[roomId] = {
      currentStatus: "free",
      occupancyCount: 0,
      nextClass: "no_class",
      subject: "-",
      faculty: "-",
      nextClassTime: "-"
    };
  }
  
  // Floor 2: A201-A210
  for (let i = 1; i <= 10; i++) {
    const roomId = `A20${i}`;
    rooms[roomId] = {
      currentStatus: "free",
      occupancyCount: 0,
      nextClass: "no_class",
      subject: "-",
      faculty: "-",
      nextClassTime: "-"
    };
  }
  
  // Floor 3: A301-A310
  for (let i = 1; i <= 10; i++) {
    const roomId = `A30${i}`;
    rooms[roomId] = {
      currentStatus: "free",
      occupancyCount: 0,
      nextClass: "no_class",
      subject: "-",
      faculty: "-",
      nextClassTime: "-"
    };
  }
  
  return rooms;
};

const initializeFirebase = async () => {
  try {
    console.log("Initializing Firebase with classroom data...");
    
    const rooms = generateRooms();
    const classroomsRef = ref(db, "classrooms");
    
    await set(classroomsRef, rooms);
    
    console.log(`✅ Successfully initialized ${Object.keys(rooms).length} classrooms!`);
    console.log("\nRooms created:");
    console.log("- Floor 1: A101-A110 (10 rooms)");
    console.log("- Floor 2: A201-A210 (10 rooms)");
    console.log("- Floor 3: A301-A310 (10 rooms)");
    console.log("\n🎉 Database initialization complete!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
    process.exit(1);
  }
};

initializeFirebase();

