
import { environment } from "../config/environment";
import { PrivilegeRequest } from "../types/privileges";

const API_URL = `${environment.baseUrl}/api`;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};

// Get a specific privilege request by ID
export const getPrivilegeRequest = async (id: string): Promise<PrivilegeRequest> => {
  const response = await fetch(`${API_URL}/privileges/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse(response);
};

// Create a new privilege request or update an existing one
export const createPrivilegeRequest = async (privilegeRequest: PrivilegeRequest): Promise<PrivilegeRequest> => {
  const method = privilegeRequest.id ? 'PUT' : 'POST';
  const endpoint = privilegeRequest.id 
    ? `${API_URL}/privileges/${privilegeRequest.id}` 
    : `${API_URL}/privileges`;
  
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(privilegeRequest),
  });
  
  return handleResponse(response);
};
