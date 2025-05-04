
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyPrivileges from './pages/MyPrivileges';
import AccessRequests from './pages/AccessRequests';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import './App.css';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './components/LanguageProvider';
import PrivilegeForm from './pages/PrivilegeForm';

const App: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem('currentUserId');

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Layout>
                    <Index />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isLoggedIn ? (
                  <Layout>
                    <Dashboard />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/privileges"
              element={
                isLoggedIn ? (
                  <Layout>
                    <MyPrivileges />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/privileges/new"
              element={
                isLoggedIn ? (
                  <Layout>
                    <PrivilegeForm />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/privileges/edit/:id"
              element={
                isLoggedIn ? (
                  <Layout>
                    <PrivilegeForm />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/access-requests"
              element={
                isLoggedIn ? (
                  <Layout>
                    <AccessRequests />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
