import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/**
 * MainLayout is the layout template for public pages (Landing Page, Search Feed, etc.).
 * It features a sticky top navigation bar, a main content section,
 * and a footer aligned to the bottom.
 */
export default function MainLayout() {
  // Safe mock user until authentication provider hook is built in later steps
  const mockUser = null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mounted Navigation Header */}
      <Navbar user={mockUser} />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Mounted Footer */}
      <Footer />
    </div>
  );
}
