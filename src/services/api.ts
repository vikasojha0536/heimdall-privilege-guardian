
import { environment } from "../config/environment";
import { PrivilegeRequest, PrivilegeUpdateRequest } from "../types/privileges";

const API_URL = `${environment.baseUrl}/api`;

// Mock data for development
const MOCK_DATA: PrivilegeRequest[] = [
  {
    id: "priv-001",
    name: "User Data Access",
    description: "Access to retrieve user profile data",
    callerClientId: "dot--tyrell--northbound",
    calleeClientId: "dot--tyrell--westbound",
    skipUserTokenExpiry: false,
    privilegeRules: [
      {
        _id: "rule-001",
        priority: 1,
        requestedURL: "/api/users/*",
        scopes: ["read:user"],
        requestedMethod: "GET",
        responseModeration: {
          fields: "name,email",
          responseFilterCriteria: ""
        }
      }
    ],
    state: "PENDING"
  },
  {
    id: "priv-002",
    name: "Product Catalog API",
    description: "Request to get product details from catalog",
    callerClientId: "dot--tyrell--northbound",
    calleeClientId: "dot--tyrell--eastbound",
    skipUserTokenExpiry: true,
    privilegeRules: [
      {
        _id: "rule-002",
        priority: 2,
        requestedURL: "/api/products",
        scopes: ["read:products"],
        requestedMethod: "GET",
        responseModeration: {
          fields: "",
          responseFilterCriteria: ""
        }
      }
    ],
    state: "APPROVED"
  },
  {
    id: "priv-003",
    name: "Order Management",
    description: "Create and manage customer orders",
    callerClientId: "dot--tyrell--southbound",
    calleeClientId: "dot--tyrell--northbound",
    skipUserTokenExpiry: false,
    privilegeRules: [
      {
        _id: "rule-003",
        priority: 1,
        requestedURL: "/api/orders",
        scopes: ["write:orders", "read:orders"],
        requestedMethod: "POST",
        responseModeration: {
          fields: "",
          responseFilterCriteria: ""
        }
      }
    ],
    state: "PENDING"
  },
  {
    id: "priv-004",
    name: "Customer Support",
    description: "Access to customer support system",
    callerClientId: "dot--tyrell--eastbound",
    calleeClientId: "dot--tyrell--northbound",
    skipUserTokenExpiry: false,
    privilegeRules: [
      {
        _id: "rule-004",
        priority: 3,
        requestedURL: "/api/support/tickets",
        scopes: ["read:tickets", "write:tickets"],
        requestedMethod: "GET",
        responseModeration: {
          fields: "",
          responseFilterCriteria: ""
        }
      }
    ],
    state: "PENDING"
  }
];

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};

// Get current user's ID from localStorage
export const getCurrentUserId = (): string => {
  return localStorage.getItem('currentUserId') || 'dot--tyrell--northbound-mock';
};

// Fetch all privilege requests relevant to the user
export const fetchPrivileges = async (id: string, actor: string) => {
  // In development, use mock data
//   if (!environment.production) {
//     console.log("Using mock data for fetchPrivileges");
//     return Promise.resolve([...MOCK_DATA]);
//   }
  
  // In production, use real API
  const response = await fetch(`${API_URL}/privileges/${id}?actor=${actor}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse(response);
};

// Get a specific privilege request by ID
export const getPrivilegeRequest = async (id: string): Promise<PrivilegeRequest | null> => {
  // In development, use mock data
//   if (!environment.production) {
//     console.log("Using mock data for getPrivilegeRequest", id);
//     const privilege = MOCK_DATA.find(p => p.id === id || p.calleeClientId === id);
//     return Promise.resolve(privilege || null);
//   }
  
  // In production, use real API
  const response = await fetch(`${API_URL}/privileges/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse(response);
};

// Create a new privilege request
export const createPrivilegeRequest = async (privilegeRequest: PrivilegeRequest) => {
  // In development, use mock data
//   if (!environment.production) {
//     console.log("Using mock data for createPrivilegeRequest", privilegeRequest);
//     // Add an ID if this is a new request
//     if (!privilegeRequest.id) {
//       privilegeRequest.id = `priv-${Math.floor(Math.random() * 1000)}`;
//     }
//
//     // If it's an existing request, update it
//     const existingIndex = MOCK_DATA.findIndex(p => p.id === privilegeRequest.id);
//     if (existingIndex !== -1) {
//       MOCK_DATA[existingIndex] = privilegeRequest;
//     } else {
//       // Otherwise add a new one
//       MOCK_DATA.push(privilegeRequest);
//     }
//
//     return Promise.resolve(privilegeRequest);
//   }
  
  // In production, use real API
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
  // In development, use mock data
//   if (!environment.production) {
//     console.log("Using mock data for updatePrivilegeRequest", updateRequest);
//     const privilege = MOCK_DATA.find(p => p.id === updateRequest.id);
//     if (privilege) {
//       privilege.state = updateRequest.state;
//     }
//     return Promise.resolve(privilege);
//   }
  
  // In production, use real API
  const response = await fetch(`${API_URL}/privileges`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateRequest),
  });
  
  return handleResponse(response);
};

// Update the state of a privilege request using the state endpoint
export const updatePrivilegeState = async (updateRequest: PrivilegeUpdateRequest) => {
  // In production, use real API
  const response = await fetch(`${API_URL}/privileges/state`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateRequest),
  });
  
  return handleResponse(response);
};
