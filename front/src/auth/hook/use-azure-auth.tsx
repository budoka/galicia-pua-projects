import {
  AccountInfo,
  AuthenticationResult,
  EndSessionRequest,
  PopupRequest,
  PublicClientApplication,
  RedirectRequest,
  SilentRequest,
  SsoSilentRequest,
} from '@azure/msal-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MSAL_CONFIG } from '../auth-config';

export type LoginType = 'loginRedirect' | 'loginPopup';

interface AuthRequests {
  loginRequest: PopupRequest | RedirectRequest;
  silentLoginRequest: SsoSilentRequest;
  silentTokenRequest: SilentRequest;
}

interface AuthContextProps {
  authInstance?: PublicClientApplication;
  data?: AuthenticationResult;
  logout?: () => void;
  disabled?: boolean;
}

const AuthContext = createContext<AuthContextProps>({});

const useProvideAuth = (disabled: boolean = false) => {
  const [authInstance, setAuthInstance] = useState<PublicClientApplication>();
  const [authRequest, setAuthRequest] = useState<AuthRequests>();
  const [data, setData] = useState<AuthenticationResult>();

  useEffect(() => {
    if (disabled) return;
    createAuthInstance();
  }, []);

  useEffect(() => {
    if (authInstance) setRequestObjects();
  }, [authInstance]);

  useEffect(() => {
    if (authInstance && authRequest) loadAuthModule();
  }, [authRequest]);

  /**
   * Create an auth instance.
   */
  const createAuthInstance = (): void => {
    setAuthInstance(new PublicClientApplication(MSAL_CONFIG));
  };

  /**
   * Initialize request objects used by this AuthModule.
   */
  const setRequestObjects = (): void => {
    /**
     * Scopes you add here will be prompted for user consent during sign-in.
     * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
     * For more information about OIDC scopes, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
     */
    const loginRequest: PopupRequest | RedirectRequest = {
      scopes: [],
    } as PopupRequest | RedirectRequest;

    const silentLoginRequest: SsoSilentRequest = {
      scopes: [],
      loginHint: getAccount()?.username,
    } as SsoSilentRequest;

    // Add here scopes for access token to be used at API endpoints.

    const silentTokenRequest: SilentRequest = {
      scopes: ['User.Read'],
      account: getAccount(),
      forceRefresh: false,
    } as SilentRequest;

    const requests: AuthRequests = {
      loginRequest,
      silentLoginRequest,
      silentTokenRequest,
    };

    setAuthRequest(requests);
  };

  /**
   * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
   * TODO: Add account chooser code
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  const getAccount = (): AccountInfo | undefined => {
    const currentAccounts = authInstance?.getAllAccounts();

    if (!currentAccounts || currentAccounts.length === 0) {
      return;
    }

    if (currentAccounts.length > 1) {
      // Add choose account code here
    }

    //console.log("account data", currentAccounts[0])
    return currentAccounts[0];
  };

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly. Only required for redirect flows.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  const loadAuthModule = async (): Promise<void> => {
    if (!authInstance) throw new Error('No se ha encontrado una instancia de autenticación.');
    if (!authRequest) throw new Error('No se ha encontrado instancias de solicitud.');

    const response = await authInstance.handleRedirectPromise();

    handleResponse(response);
  };

  /**
   * Handles the response from a popup or redirect. If response is null, will check if we have any accounts and attempt to sign in.
   * @param res
   */
  const handleResponse = async (res: AuthenticationResult | null): Promise<void> => {
    if (res) {
      setData(res);
      //console.log("res", res)
      //console.log("scopes"res.scopes)
    }
    else await attemptAcquireTokenSilent().catch(() => attemptSsoSilent());
  };

  /**
   * Attemp to acquire a silent token from cache.
   */
  const attemptAcquireTokenSilent = async () => {
    if (!authInstance) throw new Error('No se ha encontrado una instancia de autenticación.');
    if (!authRequest) throw new Error('No se ha encontrado instancias de solicitud.');

    const silentTokenRequest: SilentRequest = {
      ...authRequest.silentTokenRequest,
      account: getAccount(),
    } as SilentRequest;

    const response = await authInstance.acquireTokenSilent(silentTokenRequest);
    //console.log("re2", response)
    setData(response);
  };

  /**
   * Calls ssoSilent to attempt silent flow. If it fails due to interaction required error, it will prompt the user to login using popup.
   * @param request
   */
  const attemptSsoSilent = async (loginType: LoginType = 'loginRedirect'): Promise<void> => {
    if (!authInstance) throw new Error('No se ha encontrado una instancia de autenticación.');
    if (!authRequest) throw new Error('No se ha encontrado instancias de solicitud.');

    const silentLoginRequest = authRequest.silentLoginRequest;

    try {
      const response = await authInstance.ssoSilent(silentLoginRequest);
      setData(response);
    } catch (error) {
      login(loginType);
    }
  };

  /**
   * Calls loginPopup or loginRedirect based on given loginType.
   * @param loginType
   */
  const login = async (loginType: LoginType): Promise<void> => {
    if (!authInstance) throw new Error('No se ha encontrado una instancia de autenticación.');
    if (!authRequest) throw new Error('No se ha encontrado instancias de solicitud.');

    const loginRequest = authRequest.loginRequest;

    if (loginType === 'loginPopup') {
      try {
        const response = await authInstance.loginPopup(loginRequest);
        handleResponse(response);
      } catch (error) { }
    } else if (loginType === 'loginRedirect') {
      try {
        await authInstance.loginRedirect(loginRequest);
      } catch (error) { }
    }
  };

  /**
   * Logs out of current account.
   */
  const logout = (): void => {
    const logOutRequest: EndSessionRequest = {
      account: data?.account,
    };
    if (authInstance) authInstance.logout(logOutRequest);
  };

  return {
    authInstance,
    data,
    logout,
    disabled,
  } as AuthContextProps;
};

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAzureAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  disabled?: boolean;
  children?: React.ReactNode;
}

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAzureAuth().
export const AuthProvider = ({ disabled = false, children }: AuthProviderProps) => {
  const auth: AuthContextProps = useProvideAuth(disabled);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
