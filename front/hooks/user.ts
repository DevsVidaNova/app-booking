type User = {
  email: string;
  id: string;
  isAdmin: boolean;
}

export const createUser = async (user: User, session: boolean) => {
  if (session) {
    sessionStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = async () => {
  const res = localStorage.getItem('user') || sessionStorage.getItem('user');
  return res ? JSON.parse(res) : null;
};

export const deleteUser = async () => {
  localStorage.removeItem('user')
  sessionStorage.removeItem('user');
  return true;
}
