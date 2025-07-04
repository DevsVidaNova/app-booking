
export const createToken = async (token: string, session: boolean) => {
  // In a real application, you'd want to securely store the token
  // For this example, we'll just store it in localStorage
  if (session) {
    sessionStorage.setItem('authToken', token);
  } else {
    localStorage.setItem('authToken', token);
  }
};

export const getToken = async () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const deleteToken = async () => {
  localStorage.removeItem('authToken')
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('user');
  return true;
}

export const verifyAuth = async () => {
  if (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')) {
    return true;
  }
  else {
    return false;
  }
}