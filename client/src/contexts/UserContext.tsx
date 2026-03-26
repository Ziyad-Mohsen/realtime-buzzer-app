import React, { createContext } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { socket } from "../lib/socket";

type UserContextType = {
  userId: string | null;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
} | null;
const UserContext = createContext<UserContextType>(null);

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState(sessionStorage.getItem("User_name") || "");

  useEffect(() => {
    socket.on("session:init", (id) => {
      setUserId(id);
    });

    return () => {
      socket.off("session:init");
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("User_name", name || "");
    if (name) {
      socket.emit("updateUser", { name });
    }
  }, [name]);

  return (
    <UserContext.Provider value={{ userId, name, setName }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
}
