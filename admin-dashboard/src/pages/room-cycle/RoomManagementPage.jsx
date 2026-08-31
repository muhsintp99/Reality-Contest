import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus, Search, Edit3, Trash2, Users, UserPlus, RefreshCw, Layers, Eye, Upload, Link as LinkIcon, Image as ImageIcon, X, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { setRooms, setActiveRoom, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';

export const RoomManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { rooms, activeRoom, roomMembers, loading, pagination } = useSelector((state) => state.roomCycle);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [page, setPage] = useState(1);

  // Drawer states
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create'); // 'create' | 'edit'
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);

  // Delete Alert Box Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'room' | 'member' | 'bulk', id: string, name?: string, payload?: any }

  // Form states
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    description: '',
    maxMembers: 50,
    currentCycle: 1,
    roomImage: '',
    status: 'Active',
    autoAssignment: true
  });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'

  // Member assignment state
  const [assignUserIds, setAssignUserIds] = useState('');

  const fetchRooms = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/rooms', {
        params: { search, status: statusFilter, page, limit: 10 }
      });
      if (res.data?.success) {
        dispatch(setRooms(res.data.data));
      } else {
        dispatch(setRooms({ rooms: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setRooms({ rooms: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, statusFilter, page]);

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('error', 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRoomFormData((prev) => ({ ...prev, roomImage: event.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'create') {
        const res = await axios.post('/api/admin/room-cycle/rooms', roomFormData);
        if (res.data?.success) {
          showAlert('success', 'Room created successfully!');
          setIsRoomDrawerOpen(false);
          fetchRooms();
        }
      } else {
        const res = await axios.put(`/api/admin/room-cycle/rooms/${editingRoomId}`, roomFormData);
        if (res.data?.success) {
          showAlert('success', 'Room updated successfully!');
          setIsRoomDrawerOpen(false);
          fetchRooms();
        }
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save room');
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'room') {
        await axios.delete(`/api/admin/room-cycle/rooms/${deleteTarget.id}`);
        showAlert('success', `Room "${deleteTarget.name}" deleted successfully!`);
        fetchRooms();
      } else if (deleteTarget.type === 'member') {
        await axios.delete(`/api/admin/room-cycle/members/${deleteTarget.roomId}/${deleteTarget.id}`);
        showAlert('success', 'Member removed from room');
        if (activeRoom) openViewMembers(activeRoom);
      } else if (deleteTarget.type === 'bulk') {
        await axios.post('/api/admin/room-cycle/rooms/bulk-action', {
          roomIds: selectedRooms,
          action: deleteTarget.action
        });
        showAlert('success', `Bulk ${deleteTarget.action} executed for ${selectedRooms.length} rooms`);
        setSelectedRooms([]);
        fetchRooms();
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const openViewDetails = async (room) => {
    setViewingRoom(room);
    try {
      const res = await axios.get(`/api/admin/room-cycle/rooms/${room._id}`);
      if (res.data?.success) {
        dispatch(setActiveRoom(res.data.data));
      }
    } catch (err) {
      dispatch(setActiveRoom({ room, members: [] }));
    }
    setIsDetailsDrawerOpen(true);
  };

  const openViewMembers = async (room) => {
    try {
      const res = await axios.get(`/api/admin/room-cycle/rooms/${room._id}`);
      if (res.data?.success) {
        dispatch(setActiveRoom(res.data.data));
      }
    } catch (err) {
      dispatch(setActiveRoom({ room, members: [] }));
    }
    setIsMemberDrawerOpen(true);
  };

  const handleAssignMembers = async (e) => {
    e.preventDefault();
    if (!activeRoom) return;
    const userIdsArray = assignUserIds.split(',').map((id) => id.trim()).filter(Boolean);
    try {
      const res = await axios.post('/api/admin/room-cycle/members/assign', {
        roomId: activeRoom._id,
        userIds: userIdsArray
      });
      if (res.data?.success) {
        showAlert('success', 'Members assigned successfully!');
        setIsAssignDrawerOpen(false);
        setAssignUserIds('');
        openViewMembers(activeRoom);
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Room Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, view details, update, delete, and manage competition rooms with direct image uploads and custom confirmation alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDrawerMode('create');
              setRoomFormData({ name: '', description: '', maxMembers: 50, currentCycle: 1, roomImage: '', status: 'Active', autoAssignment: true });
              setIsRoomDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by room name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {selectedRooms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">{selectedRooms.length} selected:</span>
            <button
              onClick={() => setDeleteTarget({ type: 'bulk', action: 'Activate' })}
              className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold"
            >
              Activate
            </button>
            <button
              onClick={() => setDeleteTarget({ type: 'bulk', action: 'Archive' })}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold"
            >
              Archive
            </button>
            <button
              onClick={() => setDeleteTarget({ type: 'bulk', action: 'Delete' })}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Datatable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No rooms found</p>
            <p className="text-xs mt-1">Click "Create Room" to create a new room for competition members.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRooms(rooms.map((r) => r._id));
                        else setSelectedRooms([]);
                      }}
                      checked={selectedRooms.length === rooms.length && rooms.length > 0}
                    />
                  </th>
                  <th className="p-4">Room Image</th>
                  <th className="p-4">Room Name</th>
                  <th className="p-4">Room Code</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Max Members</th>
                  <th className="p-4">Current Members</th>
                  <th className="p-4">Current Cycle</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRooms([...selectedRooms, room._id]);
                          else setSelectedRooms(selectedRooms.filter((id) => id !== room._id));
                        }}
                      />
                    </td>
                    <td className="p-4">
                      {room.roomImage ? (
                        <img
                          src={room.roomImage}
                          alt={room.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xs">
                          {room.code ? room.code.slice(0, 3) : 'RM'}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{room.name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-mono font-bold">
                        {room.code}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {room.description || '—'}
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {room.maxMembers}
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{room.membersCount || 0}</span>
                        {room.membersCount >= room.maxMembers && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-md">
                            FULL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-xs font-bold">
                        Cycle {room.currentCycle || 1}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          room.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : room.status === 'Archived'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {room.createdDate ? new Date(room.createdDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewDetails(room)}
                          title="View Full Room Details"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openViewMembers(room)}
                          title="Manage Members"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRoomId(room._id);
                            setDrawerMode('edit');
                            setRoomFormData({
                              name: room.name,
                              description: room.description || '',
                              maxMembers: room.maxMembers,
                              currentCycle: room.currentCycle || 1,
                              roomImage: room.roomImage || '',
                              status: room.status,
                              autoAssignment: room.autoAssignment
                            });
                            setIsRoomDrawerOpen(true);
                          }}
                          title="Edit Room"
                          className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'room', id: room._id, name: room.name })}
                          title="Delete Room"
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Styled Delete Confirmation Alert Box Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Confirm Action</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              {deleteTarget.type === 'room' && `Are you sure you want to permanently delete the room "${deleteTarget.name}"?`}
              {deleteTarget.type === 'member' && `Are you sure you want to remove user "${deleteTarget.name}" from this room?`}
              {deleteTarget.type === 'bulk' && `Are you sure you want to execute bulk "${deleteTarget.action}" on ${selectedRooms.length} selected rooms?`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Room Details Drawer */}
      <RightDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={viewingRoom ? `Room Details: ${viewingRoom.name}` : 'Room Details'}
      >
        {viewingRoom && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-[#E2F1D5]/60 dark:bg-slate-900/80 rounded-2xl border border-[#C4E2A8]/80 dark:border-slate-800">
              {viewingRoom.roomImage ? (
                <img src={viewingRoom.roomImage} alt={viewingRoom.name} className="w-16 h-16 rounded-2xl object-cover border shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                  {viewingRoom.code ? viewingRoom.code.slice(0, 3) : 'RM'}
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{viewingRoom.name}</h3>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-md mt-1">
                  Code: {viewingRoom.code}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Current Cycle</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Cycle {viewingRoom.currentCycle || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Member Capacity</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingRoom.membersCount || 0} / {viewingRoom.maxMembers}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Accumulated Points</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{(viewingRoom.totalPoints || 0).toLocaleString()} pts</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Leaderboard Rank</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">#{viewingRoom.rank || '-'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                {viewingRoom.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Assigned Room Members ({roomMembers.length})</h4>
              {roomMembers.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 text-center bg-slate-50 dark:bg-slate-900/60 rounded-xl">No members currently assigned to this room.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {roomMembers.map((m) => (
                    <div key={m._id} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{m.userId?.name || 'Member'}</span>
                        <p className="text-[11px] text-slate-500">{m.userId?.email}</p>
                      </div>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{m.accumulatedPoints || 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* Room Drawer (Create / Edit) */}
      <RightDrawer
        isOpen={isRoomDrawerOpen}
        onClose={() => setIsRoomDrawerOpen(false)}
        title={drawerMode === 'create' ? 'Create New Room' : 'Edit Room'}
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Name</label>
            <input
              type="text"
              required
              value={roomFormData.name}
              onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              placeholder="e.g. Alpha Strikers"
            />
          </div>

          {/* Room Image Selection: Dual Upload & URL mode */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Room Image</label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    imageInputMode === 'upload' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    imageInputMode === 'url' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" /> Image URL
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
            ) : (
              <input
                type="text"
                value={roomFormData.roomImage}
                onChange={(e) => setRoomFormData({ ...roomFormData, roomImage: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                placeholder="https://example.com/room-banner.png"
              />
            )}

            {roomFormData.roomImage && (
              <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={roomFormData.roomImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setRoomFormData({ ...roomFormData, roomImage: '' })}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={roomFormData.description}
              onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Members</label>
              <input
                type="number"
                min={1}
                max={100}
                value={roomFormData.maxMembers}
                onChange={(e) => setRoomFormData({ ...roomFormData, maxMembers: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Cycle</label>
              <input
                type="number"
                min={1}
                max={10}
                value={roomFormData.currentCycle}
                onChange={(e) => setRoomFormData({ ...roomFormData, currentCycle: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={roomFormData.status}
                onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoAssign"
              checked={roomFormData.autoAssignment}
              onChange={(e) => setRoomFormData({ ...roomFormData, autoAssignment: e.target.checked })}
            />
            <label htmlFor="autoAssign" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Allow Auto Assignment
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRoomDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
            >
              {drawerMode === 'create' ? 'Create Room' : 'Save Changes'}
            </button>
          </div>
        </form>
      </RightDrawer>

      {/* Member Management Drawer */}
      <RightDrawer
        isOpen={isMemberDrawerOpen}
        onClose={() => setIsMemberDrawerOpen(false)}
        title={activeRoom ? `${activeRoom.name} Members` : 'Room Members'}
      >
        {activeRoom && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase">Room Code: {activeRoom.code}</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {roomMembers.length} / {activeRoom.maxMembers} Members Assigned
                </p>
              </div>
              <button
                onClick={() => setIsAssignDrawerOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Assign Users
              </button>
            </div>

            {roomMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-xs">No members currently assigned.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {roomMembers.map((member) => (
                  <div key={member._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {member.userId?.name ? member.userId.name.slice(0, 2) : 'US'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {member.userId?.name || 'User'}
                          {member.role === 'Leader' && (
                            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">
                              Leader
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">{member.userId?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {member.accumulatedPoints || 0} pts
                      </span>
                      <button
                        onClick={() => setDeleteTarget({ type: 'member', roomId: activeRoom._id, id: member.userId?._id || member.userId, name: member.userId?.name || 'User' })}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </RightDrawer>

      {/* Manual Member Assign Drawer */}
      <RightDrawer
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        title="Assign Members"
      >
        <form onSubmit={handleAssignMembers} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              User IDs (Comma Separated)
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. 6601f2a..., 6601f2b..."
              value={assignUserIds}
              onChange={(e) => setAssignUserIds(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
            >
              Assign Members
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default RoomManagementPage;
