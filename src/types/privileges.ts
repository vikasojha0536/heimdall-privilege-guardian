
export interface ResponseModeration {
  fields: string;
  responseFilterCriteria: string;
}

export interface PrivilegeRule {
  _id: string;
  priority: number;
  requestedURL: string;
  scopes: string[];
  requestedMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseModeration: ResponseModeration;
}

export type PrivilegeState = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PrivilegeRequest {
  id?: string;
  name: string;
  description: string;
  callerClientId: string;
  calleeClientId: string;
  skipUserTokenExpiry: boolean;
  privilegeRules: PrivilegeRule[];
  state: PrivilegeState;
}

export interface PrivilegeUpdateRequest {
  id: string;
  state: PrivilegeState;
}

export const emptyPrivilegeRule: PrivilegeRule = {
  _id: '',
  priority: 0,
  requestedURL: '',
  scopes: [],
  requestedMethod: 'GET',
  responseModeration: {
    fields: '',
    responseFilterCriteria: ''
  }
};

export const emptyPrivilegeRequest: PrivilegeRequest = {
  name: '',
  description: '',
  callerClientId: '',
  calleeClientId: '',
  skipUserTokenExpiry: false,
  privilegeRules: [{ ...emptyPrivilegeRule }],
  state: 'PENDING'
};
