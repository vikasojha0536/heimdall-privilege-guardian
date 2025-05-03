
import { environment } from "../config/environment";
import { PrivilegeRequest, PrivilegeUpdateRequest } from "../types/privileges";

const API_URL = `${environment.baseUrl}/api`;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};

// Get current user's ID (simulated in dev mode)
export const getCurrentUserId = (): string => {
  // In production, this would come from the auth service
  return localStorage.getItem('currentUserId') || 'dev-user-123';
};

// Fetch all privilege requests relevant to the user
export const fetchPrivileges = async () => {
  const response = await fetch(`${API_URL}/privileges`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse(response);
};

// Create a new privilege request
export const createPrivilegeRequest = async (privilegeRequest: PrivilegeRequest) => {
  const response = await fetch(`${API_URL}/privileges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(privilegeRequest),
  });
  
  return handleResponse(response);
};

// Update the state of a privilege request
export const updatePrivilegeRequest = async (updateRequest: PrivilegeUpdateRequest) => {
  const response = await fetch(`${API_URL}/privileges`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateRequest),
  });
  
  return handleResponse(response);
};
