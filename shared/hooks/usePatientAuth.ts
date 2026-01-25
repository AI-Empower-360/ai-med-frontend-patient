"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authApi,
  clearAuthToken,
  getAuthToken,
  subscribeAuthToken,
  type PatientLoginRequest,
  type PatientLoginResponse,
} from "@/lib/api-client";

export interface Patient {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  patient: Patient | null;
  isLoading: boolean;
}

/**
 * Patient auth hook
 * - Stores tokens in-memory only (no localStorage/sessionStorage)
 * - Redirects to /login on token loss (e.g., 401)
 */
export function usePatientAuth() {
  const router = useRouter();

  const [state, setState] = useState<AuthState>(() => {
    const token = getAuthToken();
    return {
      isAuthenticated: !!token,
      patient: null,
      isLoading: false,
    };
  });

  useEffect(() => {
    const unsubscribe = subscribeAuthToken((nextToken) => {
      if (!nextToken) {
        setState({ isAuthenticated: false, patient: null, isLoading: false });
        router.push("/login");
      } else {
        setState((prev) => ({ ...prev, isAuthenticated: true, isLoading: false }));
      }
    });
    return () => unsubscribe();
  }, [router]);

  const login = useCallback(async (credentials: PatientLoginRequest): Promise<PatientLoginResponse> => {
    try {
      const response = await authApi.loginPatient(credentials);
      setState({
        isAuthenticated: true,
        patient: response.patient,
        isLoading: false,
      });
      return response;
    } catch (e) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    clearAuthToken();
    setState({ isAuthenticated: false, patient: null, isLoading: false });
    router.push("/login");
  }, [router]);

  return {
    ...state,
    login,
    logout,
  };
}

