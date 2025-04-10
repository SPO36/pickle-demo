// Layout.jsx
function Layout({ headerContent, children }) {
  return (
    <div className="bg-base-200 min-h-screen">
      {headerContent}
      <main className="space-y-12 mx-auto px-6 py-8 max-w-screen-xl">{children}</main>
    </div>
  );
}

export default Layout;
