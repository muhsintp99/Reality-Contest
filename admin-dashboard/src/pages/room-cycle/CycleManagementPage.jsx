import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

/**
 * DEPRECATED: The Cycle Management section and /api/admin/room-cycle/cycles
 * endpoints have been completely removed from the project.
 * Any access is automatically redirected to Room Management.
 */
export const CycleManagementPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin-dashboard/bi-weekly-room/rooms', { replace: true });
  }, [navigate]);

  return <Navigate to="/admin-dashboard/bi-weekly-room/rooms" replace />;
};

export default CycleManagementPage;
