export interface ResponseModeration {
  fields: string | null;
  responseFilterCriteria: string | null;
}

export interface PrivilegeRule {
  _id?: string;
  id?: string;
  priority: number;
  description?: string | null;
  requestedURL: string;
  scopes: string[];
  requestedMethod:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS"
    | "HEAD"
    | "ALL"
    | "";
  responseModeration: ResponseModeration;
  disableAccessTokenValidation?: boolean;
  disableAccessTokenExpiryValidation?: boolean;
}

export type PrivilegeState =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "GRANTED"
  | "ACTIVE"
  | "INACTIVE";

export interface PrivilegeRequest {
  id?: string;
  name: string;
  description: string;
  callerClientId: string;
  calleeClientId: string;
  skipUserTokenExpiry?: boolean;
  privilegeRules: PrivilegeRule[];
  state: PrivilegeState;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PrivilegeUpdateRequest {
  id: string;
  state: PrivilegeState;
  calleeClientId: string;
  callerClientId: string;
  responseModeration?: ResponseModeration;
  privilegeRules: PrivilegeRule[];
}

export const emptyPrivilegeRule: PrivilegeRule = {
  priority: 0,
  requestedURL: "",
  scopes: [],
  requestedMethod: "GET",
  responseModeration: {
    fields: null,
    responseFilterCriteria: null,
  },
  disableAccessTokenValidation: false,
  disableAccessTokenExpiryValidation: false,
};

export const emptyPrivilegeRequest: PrivilegeRequest = {
  name: "",
  description: "",
  callerClientId: "",
  calleeClientId: "",
  skipUserTokenExpiry: false,
  privilegeRules: [],
  state: "PENDING",
};
