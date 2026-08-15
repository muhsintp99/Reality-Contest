const getBackendOrigin = () => {
  if (typeof window === 'undefined') return '';
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:10000`;
  }
  return '';
};

export const resolveAvatarSrc = (userOrUrl, defaultSeed = 'User') => {
  if (!userOrUrl) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}`;
  }

  let rawUrl = typeof userOrUrl === 'string'
    ? userOrUrl
    : (userOrUrl?.profileImage || userOrUrl?.photo || userOrUrl?.image || userOrUrl?.profilePicture || userOrUrl?.avatar);

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    const seed = typeof userOrUrl === 'object' ? (userOrUrl?.username || userOrUrl?.name || defaultSeed) : defaultSeed;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }

  const cleanUrl = rawUrl.trim();

  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  const backendOrigin = getBackendOrigin();

  if (cleanUrl.includes('/uploads/') || cleanUrl.includes('/public/uploads/')) {
    const pathPart = cleanUrl.includes('/uploads/')
      ? cleanUrl.split('/uploads/')[1]
      : cleanUrl.split('/public/uploads/')[1];
    return `${backendOrigin}/uploads/${pathPart}`;
  }

  if (cleanUrl.startsWith('/')) {
    return `${backendOrigin}${cleanUrl}`;
  }

  return `${backendOrigin}/uploads/${cleanUrl}`;
};

export default resolveAvatarSrc;
