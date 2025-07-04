const KEY_DATA = "@store";

const getStore = async () => {
  try {
    const res = localStorage.getItem(KEY_DATA);
    return res ? JSON.parse(res) : null;
  } catch (error) {
    console.error("Error getting store:", error);
    return null;
  }
};

const selectStore = async (store: any) => {
  try {
    localStorage.setItem(KEY_DATA, JSON.stringify(store));
    return true;
  } catch (error) {
    console.error("Error selecting store:", error);
    return false;
  }
};

const excludeStore = async () => {
  try {
    localStorage.removeItem(KEY_DATA);
    return true;
  } catch (error) {
    console.error("Error excluding store:", error);
    return false;
  }
};

export { getStore, selectStore, excludeStore };
