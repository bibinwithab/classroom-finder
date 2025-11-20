// src/Dashboard.tsx
import { useState, useEffect, JSX } from "react";
import { Link } from "react-router-dom";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "./firebase";

interface Room {
  id: string;
  occupancyCount: number;
  currentStatus?: string;
  nextClass?: string;
  subject?: string;
  faculty?: string;
  nextClassTime?: string;
  // add any other fields you store
}

export default function Dashboard(): JSX.Element {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newRoomId, setNewRoomId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Fetch all rooms from Firebase Realtime Database
  useEffect(() => {
    const roomsRef = ref(db, "classrooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val() as Record<string, Omit<Room, "id">> | null;
      if (data) {
        const roomList: Room[] = Object.entries(data).map(([id, values]) => ({
          id,
          ...(values as Omit<Room, "id">),
        }));
        setRooms(roomList);
      } else {
        setRooms([]);
      }
      setLoading(false);
    });

    // onValue returns an unsubscribe function
    return () => unsubscribe();
  }, []);

  // Helper to create a new room
  const handleAddRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newRoomId.trim()) return;

    set(ref(db, `classrooms/${newRoomId}`), {
      occupancyCount: 0,
      currentStatus: "free",
      nextClass: "no_class",
      subject: "-",
      faculty: "-",
      nextClassTime: "-",
    });

    setNewRoomId("");
    setShowAddModal(false);
  };

  // Helper to delete a room — note: no event param; easier to call after preventing propagation
  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm(`Are you sure you want to delete Room ${roomId}?`)) {
      await remove(ref(db, `classrooms/${roomId}`));
    }
  };

  // Calculate Stats
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => (r.occupancyCount ?? 0) > 0).length;
  const freeRooms = totalRooms - occupiedRooms;

  const getStatusColor = (room: Room) => {
    if (room.currentStatus === "occupied" || (room.occupancyCount ?? 0) > 0)
      return "bg-red-100 text-red-700 border-red-200";
    if (room.nextClass === "faculty_coming")
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getStatusDot = (room: Room) => {
    if (room.currentStatus === "occupied" || (room.occupancyCount ?? 0) > 0) return "bg-red-500";
    if (room.nextClass === "faculty_coming") return "bg-amber-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Campus Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-600 flex items-center gap-2">🏫 Campus Classroom Monitor</h1>
              <p className="text-gray-500 mt-1">Real-time occupancy dashboard</p>
            </div>
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {showAddModal ? "Cancel" : "➕ Add Classroom"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Room Form Panel */}
      {showAddModal && (
        <div className="max-w-6xl mx-auto px-6 mt-6 animate-fade-in-down">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
            <h3 className="text-lg font-bold text-purple-800 mb-4">Add New Classroom</h3>
            <form onSubmit={handleAddRoom} className="flex gap-4">
              <input
                type="text"
                placeholder="Room Number (e.g., 304-A)"
                value={newRoomId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoomId(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
              <button type="submit" className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-sm transition-colors">
                Save Room
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-purple-500">
            <div className="text-gray-500 font-semibold mb-2">Total Classrooms</div>
            <div className="text-4xl font-bold text-gray-800">{totalRooms}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-green-500">
            <div className="text-gray-500 font-semibold mb-2">Free Now</div>
            <div className="text-4xl font-bold text-green-600">{freeRooms}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-red-500">
            <div className="text-gray-500 font-semibold mb-2">Occupied</div>
            <div className="text-4xl font-bold text-red-600">{occupiedRooms}</div>
          </div>
        </div>

        {/* Rooms Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Classrooms</h2>

        {rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300">
            <p className="text-xl text-gray-400">No classrooms found.</p>
            <p className="text-gray-400">Click "Add Classroom" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="relative">
                <Link
                  to={`/room/${room.id}`}
                  className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Status Banner */}
                  <div className={`px-6 py-3 flex justify-between items-center border-b ${getStatusColor(room)}`}>
                    <span className="font-bold text-sm uppercase tracking-wider">
                      {(room.occupancyCount ?? 0) > 0 ? "Occupied" : "Free"}
                    </span>
                    <div className={`h-3 w-3 rounded-full ${getStatusDot(room)} animate-pulse`}></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{room.id}</h3>
                      <div className="bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-2">
                        <span className="text-lg">👥</span>
                        <span className="font-bold text-gray-700">{room.occupancyCount ?? 0}</span>
                      </div>
                    </div>

                    {/* Next Class Preview */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {room.nextClass === "faculty_coming" ? (
                        <div className="text-sm">
                          <p className="text-amber-600 font-bold flex items-center gap-1">⏳ Upcoming: {room.nextClassTime}</p>
                          <p className="text-gray-600 truncate w-full">{room.subject}</p>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic flex items-center gap-1">
                          <span>✓ No upcoming classes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Action */}
                  <div className="bg-gray-50 px-6 py-3 text-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Click to manage room →
                  </div>
                </Link>

                {/* Delete Button - placed outside the Link wrapper so clicks won't navigate */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteRoom(room.id);
                  }}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 transition-colors"
                  title="Delete Room"
                  aria-label={`Delete ${room.id}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
