export const isAuthed = () => !!localStorage.getItem("access_token");

export const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
};


