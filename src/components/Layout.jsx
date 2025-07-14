import MenuPage from '../pages/MenuPage';

function Layout({ headerContent, children }) {
  return (
    <div className="drawer drawer-end">
      {/* ✅ Drawer 토글용 hidden checkbox */}
      <input id="menu-drawer" type="checkbox" className="drawer-toggle" />

      {/* 본문 내용 */}
      <div className="min-h-screen drawer-content">
        {/* 헤더를 sticky로 고정 */}
        <div className="top-0 z-40 sticky bg-base-100 mx-auto max-w-screen-xl">{headerContent}</div>
        <main className="space-y-12 mx-auto px-6 py-6 max-w-screen-xl">{children}</main>
      </div>

      {/* 오른쪽 드로어 (MenuPage) */}
      <div className="z-50 drawer-side">
        <label htmlFor="menu-drawer" className="drawer-overlay" />
        <div className="bg-base-100 p-4 w-80 min-h-full">
          <div className="flex justify-end mb-2">
            <label htmlFor="menu-drawer" className="btn btn-sm btn-circle">
              ✕
            </label>
          </div>
          <MenuPage />
        </div>
      </div>
    </div>
  );
}

export default Layout;
