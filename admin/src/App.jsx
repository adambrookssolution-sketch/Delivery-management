import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShipmentList from './pages/ShipmentList';
import CreateShipment from './pages/CreateShipment';
import ShipmentDetail from './pages/ShipmentDetail';
import ShipmentLabel from './pages/ShipmentLabel';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          containerStyle={{
            zIndex: 99999,
            pointerEvents: 'none'
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              pointerEvents: 'auto'
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shipments"
            element={
              <PrivateRoute>
                <Layout>
                  <ShipmentList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shipments/new"
            element={
              <PrivateRoute>
                <Layout>
                  <CreateShipment />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shipments/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <ShipmentDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shipments/:id/label"
            element={
              <PrivateRoute>
                <Layout>
                  <ShipmentLabel />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Layout>
                  <Users />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
