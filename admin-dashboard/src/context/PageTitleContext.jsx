import React, { createContext, useContext, useState, useEffect } from 'react';

const PageTitleContext = createContext({
  customTitle: '',
  setCustomTitle: () => {},
  breadcrumbsOverride: null,
  setBreadcrumbsOverride: () => {}
});

export const PageTitleProvider = ({ children }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [breadcrumbsOverride, setBreadcrumbsOverride] = useState(null);

  useEffect(() => {
    if (customTitle && typeof customTitle === 'string') {
      document.title = `${customTitle} | Haka Admin Dashboard`;
    } else {
      document.title = 'Haka - Admin Dashboard & Control Center';
    }
  }, [customTitle]);

  return (
    <PageTitleContext.Provider
      value={{
        customTitle,
        setCustomTitle,
        breadcrumbsOverride,
        setBreadcrumbsOverride
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => useContext(PageTitleContext);
export default PageTitleContext;
