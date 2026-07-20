import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

/**
 * Main App entry point. Renders the RouterProvider to mount the application routes hierarchy.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
