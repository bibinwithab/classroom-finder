// src/RoomPage.tsx
import { useEffect, useState, JSX} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ref, update, onValue, remove } from "firebase/database";
import { db } from "./firebase";

/** Minimal Room type used by this page; move to src/types.ts if used across files */
interface Room {
  id?: string;
  occupancyCount?: number;
  currentStatus?: string;
  nextClass?: string;
  subject?: string;
  faculty?: string;
  nextClassTime?: string;
}

interface FacultyInput {
  subject: string;
  facultyName: string;
  time: string;
}

export default function RoomPage(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [showFacultyPanel, setShowFacultyPanel] = useState<boolean>(false);
  const [facultyInput, setFacultyInput] = useState<FacultyInput>({
    subject: "",
    facultyName: "",
    time: "",
  });
  const [accessCode, setAccessCode] = useState<string>("");
  const [isFacultyVerified, setIsFacultyVerified] = useState<boolean>(false);

  const FACULTY_ACCESS_CODE = "1111"; // Simple access code (consider moving to env)

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `classrooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as Room | null;
      setRoom(data);
    });

    return () => {
      // cleanup listener
      unsubscribe();
    };
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Room ID missing from URL.</p>
          <button onClick={() => navigate("/")} className="mt-2 text-purple-600">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // safe integer occupancy value
  const occupancy = (room.occupancyCount ?? 0) as number;

  const handleEnter = async (): Promise<void> => {
    const newCount = occupancy + 1;
    await update(ref(db, `classrooms/${roomId}`), {
      currentStatus: newCount > 0 ? "occupied" : "free",
      occupancyCount: newCount,
    });
  };

  const handleExit = async (): Promise<void> => {
    const newCount = Math.max(occupancy - 1, 0);
    await update(ref(db, `classrooms/${roomId}`), {
      currentStatus: newCount > 0 ? "occupied" : "free",
      occupancyCount: newCount,
    });
  };

  const handleFacultyAccess = (): void => {
    if (accessCode === FACULTY_ACCESS_CODE) {
      setIsFacultyVerified(true);
      setShowFacultyPanel(true);
    } else {
      window.alert("Invalid access code!");
    }
  };

  const scheduleClass = async (): Promise<void> => {
    if (!facultyInput.subject || !facultyInput.time) {
      window.alert("Please fill in Subject and Time");
      return;
    }

    await update(ref(db, `classrooms/${roomId}`), {
      nextClass: "faculty_coming",
      subject: facultyInput.subject,
      faculty: facultyInput.facultyName,
      nextClassTime: facultyInput.time,
    });

    setShowFacultyPanel(false);
    setFacultyInput({ subject: "", facultyName: "", time: "" });
    window.alert("Class scheduled successfully!");
  };

  const clearScheduledClass = async (): Promise<void> => {
    await update(ref(db, `classrooms/${roomId}`), {
      nextClass: "no_class",
      subject: "-",
      faculty: "-",
      nextClassTime: "-",
    });
    window.alert("Scheduled class cleared!");
  };

  const deleteRoom = async (): Promise<void> => {
    if (!window.confirm(`Delete room ${roomId}?`)) return;
    await remove(ref(db, `classrooms/${roomId}`));
    navigate("/");
  };

  const getStatusColor = (): string => {
    if (room.currentStatus === "occupied") return "bg-red-500";
    if (room.nextClass === "faculty_coming") return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusText = (): string => {
    if (room.currentStatus === "occupied") return "Occupied";
    if (room.nextClass === "faculty_coming") return "Upcoming Class";
    return "Free";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-2"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-purple-600">Room {roomId}</h1>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={`px-6 py-3 rounded-2xl text-white font-bold text-lg ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <button onClick={deleteRoom} className="text-sm text-red-600 hover:underline">
                Delete Room
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-6xl font-bold text-purple-600">{roomId}</div>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">{occupancy}</div>
              <div className="text-gray-600 text-lg">Students Inside</div>
            </div>

            {/* Student Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleEnter}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-lg"
              >
                📥 Enter
              </button>
              <button
                onClick={handleExit}
                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-lg"
              >
                📤 Exit
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Class Info */}
        {room.nextClass === "faculty_coming" && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-amber-800 mb-3">📚 Upcoming Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-amber-700 font-semibold">Subject</p>
                <p className="text-lg text-amber-900">{room.subject ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 font-semibold">Faculty</p>
                <p className="text-lg text-amber-900">{room.faculty ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 font-semibold">Time</p>
                <p className="text-lg text-amber-900">{room.nextClassTime ?? "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Panel Access */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!isFacultyVerified ? (
            <div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">👨‍🏫 Faculty Panel</h3>
              <p className="text-gray-600 mb-4">Enter access code to schedule upcoming classes</p>
              <div className="flex gap-3">
                <input
                  type="password"
                  placeholder="Enter Access Code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
                <button onClick={handleFacultyAccess} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
                  Verify
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-purple-600 flex items-center gap-2">👨‍🏫 Schedule Next Class</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowFacultyPanel(!showFacultyPanel)} className="text-purple-600 hover:text-purple-700 font-semibold">
                    {showFacultyPanel ? "Hide" : "Schedule Class"}
                  </button>
                  <button onClick={() => { setIsFacultyVerified(false); setShowFacultyPanel(false); }} className="text-sm text-gray-500">
                    Logout
                  </button>
                </div>
              </div>

              {showFacultyPanel && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Subject Name"
                    value={facultyInput.subject}
                    onChange={(e) => setFacultyInput({ ...facultyInput, subject: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Faculty Name"
                    value={facultyInput.facultyName}
                    onChange={(e) => setFacultyInput({ ...facultyInput, facultyName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Time (e.g., 2:00 PM - 3:30 PM)"
                    value={facultyInput.time}
                    onChange={(e) => setFacultyInput({ ...facultyInput, time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={scheduleClass} className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
                      Schedule Class
                    </button>
                    {room.nextClass === "faculty_coming" && (
                      <button onClick={clearScheduledClass} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
                        Clear Scheduled Class
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
