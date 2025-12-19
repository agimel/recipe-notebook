import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginView from './views/LoginView';
import RegistrationView from './views/RegistrationView';
import RecipeListView from './views/RecipeListView';
import CreateRecipeView from './views/CreateRecipeView';
import RecipeDetailView from './views/RecipeDetailView';
import RecipeEditView from './views/RecipeEditView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegistrationView />} />
          <Route 
            path="/recipes" 
            element={
              <ProtectedRoute>
                <RecipeListView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipes/new" 
            element={
              <ProtectedRoute>
                <CreateRecipeView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipes/:id/edit" 
            element={
              <ProtectedRoute>
                <RecipeEditView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipes/:id" 
            element={
              <ProtectedRoute>
                <RecipeDetailView />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<LoginView />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
