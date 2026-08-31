import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layers, Plus, Search, Edit3, Trash2, Users, UserPlus, RefreshCw, Eye, Upload, Link as LinkIcon, Image as ImageIcon, X, ShieldCheck, Award, Calendar, Grid, List
} from 'lucide-react';
import axios from 'axios';
import { setRooms, setActiveRoom, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';
import { CustomSelect } from '../../components/CustomSelect';

export const RoomManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { rooms, activeRoom, roomMembers, loading, pagination } = useSelector((state) => state.roomCycle);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Drawer states
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create'); // 'create' | 'edit'
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);

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
      showAlert('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Image size should be less than 5MB', 'error');
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
          showSnackbar('Room created successfully!', 'success');
          setIsRoomDrawerOpen(false);
          fetchRooms();
        }
      } else {
        const res = await axios.put(`/api/admin/room-cycle/rooms/${editingRoomId}`, roomFormData);
        if (res.data?.success) {
          showSnackbar('Room updated successfully!', 'success');
          setIsRoomDrawerOpen(false);
          fetchRooms();
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save room', 'error');
    }
  };

  const handleDeleteRoomClick = (room) => {
    showConfirm('Delete Room', `Are you sure you want to permanently delete room "${room.name}"?`, async () => {
      try {
        await axios.delete(`/api/admin/room-cycle/rooms/${room._id}`);
        showSnackbar(`Room "${room.name}" deleted!`, 'success');
        fetchRooms();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete room', 'error');
      }
    });
  };

  const handleRemoveMemberClick = (member) => {
    const memberName = member.userId?.name || 'User';
    showConfirm('Remove Member', `Are you sure you want to remove user "${memberName}" from this room?`, async () => {
      try {
        await axios.delete(`/api/admin/room-cycle/members/${activeRoom._id}/${member.userId?._id || member.userId}`);
        showSnackbar('Member removed from room', 'success');
        if (activeRoom) openViewMembers(activeRoom);
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to remove member', 'error');
      }
    });
  };

  const handleBulkActionClick = (action) => {
    if (!selectedRooms.length) return;
    showConfirm(`Bulk ${action}`, `Are you sure you want to execute bulk "${action}" on ${selectedRooms.length} selected rooms?`, async () => {
      try {
        await axios.post('/api/admin/room-cycle/rooms/bulk-action', {
          roomIds: selectedRooms,
          action
        });
        showSnackbar(`Bulk ${action} executed for ${selectedRooms.length} rooms`, 'success');
        setSelectedRooms([]);
        fetchRooms();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Bulk action failed', 'error');
      }
    });
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
        showSnackbar('Members assigned successfully!', 'success');
        setIsAssignDrawerOpen(false);
        setAssignUserIds('');
        openViewMembers(activeRoom);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Assignment failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Page Title & Controls - Exact Contest Management Desk Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brandPrimary" />
            Room Management Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, Edit, Delete, View Room Details, manage Capacity, Cycles, and Member Allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDrawerMode('create');
              setRoomFormData({ name: '', description: '', maxMembers: 50, currentCycle: 1, roomImage: '', status: 'Active', autoAssignment: true });
              setIsRoomDrawerOpen(true);
            }}
            className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-md hover:bg-brandPrimary/90 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>
      </div>

      {/* Search & Filter Desk Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active ⚡' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Archived', label: 'Archived 📦' }
            ]}
            className="w-48"
          />

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-400'
              }`}
              title="Grid Cards View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Display Cards Grid / Datatable */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
              <div className="w-full h-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-full" />
              <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 dark:text-white/20" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Rooms Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">No competition rooms match your current search query or filter settings.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-brandPrimary/30 transition-all"
            >
              <div className="space-y-3">
                {room.roomImage ? (
                  <img
                    src={room.roomImage}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-white/10"
                    alt={room.name}
                  />
                ) : (
                  <div className="w-full h-36 rounded-xl bg-gradient-to-tr from-brandPrimary/20 via-emerald-500/10 to-indigo-500/20 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-2xl text-brandPrimary">
                    {room.code || 'ROOM'}
                  </div>
                )}

                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded text-[10px] inline-block mb-1">
                      {room.code}
                    </span>
                    <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-base leading-snug">
                      {room.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      room.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : room.status === 'Archived'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {room.description || 'No description provided.'}
                </p>

                {/* Capacity & Cycle Pill Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase">Members</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">
                      {room.membersCount || 0} / {room.maxMembers}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase">Current Cycle</span>
                    <span className="font-extrabold text-brandPrimary">
                      Cycle {room.currentCycle || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Desk Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openViewDetails(room)}
                    title="View Room Details"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openViewMembers(room)}
                    title="Manage Members"
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
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
                    className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteRoomClick(room)}
                  title="Delete Room"
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Room Image</th>
                  <th className="p-4">Room Name</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Max Members</th>
                  <th className="p-4">Current Members</th>
                  <th className="p-4">Current Cycle</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      {room.roomImage ? (
                        <img src={room.roomImage} alt={room.name} className="w-10 h-10 rounded-xl object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-brandPrimary/10 text-brandPrimary flex items-center justify-center font-extrabold text-xs">
                          {room.code ? room.code.slice(0, 3) : 'RM'}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{room.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold rounded">
                        {room.code}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 max-w-xs truncate">{room.description || '—'}</td>
                    <td className="p-4 font-semibold">{room.maxMembers}</td>
                    <td className="p-4 font-semibold">{room.membersCount || 0}</td>
                    <td className="p-4 font-bold text-brandPrimary">Cycle {room.currentCycle || 1}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-full">
                        {room.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openViewDetails(room)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openViewMembers(room)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
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
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteRoomClick(room)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <div className="w-16 h-16 rounded-2xl bg-brandPrimary text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                  {viewingRoom.code ? viewingRoom.code.slice(0, 3) : 'RM'}
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{viewingRoom.name}</h3>
                <span className="inline-block px-2.5 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold text-xs rounded-md mt-1">
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
                    imageInputMode === 'upload' ? 'bg-white dark:bg-slate-900 text-brandPrimary shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    imageInputMode === 'url' ? 'bg-white dark:bg-slate-900 text-brandPrimary shadow-sm' : 'text-slate-500'
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
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brandPrimary/10 file:text-brandPrimary hover:file:bg-brandPrimary/20"
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
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-sm font-semibold"
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
            <div className="p-4 bg-brandPrimary/10 dark:bg-slate-900 rounded-xl border border-brandPrimary/20 flex justify-between items-center">
              <div>
                <p className="text-xs text-brandPrimary font-bold uppercase">Room Code: {activeRoom.code}</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {roomMembers.length} / {activeRoom.maxMembers} Members Assigned
                </p>
              </div>
              <button
                onClick={() => setIsAssignDrawerOpen(true)}
                className="px-3 py-1.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1"
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
                        onClick={() => handleRemoveMemberClick(member)}
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
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-sm font-semibold"
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
