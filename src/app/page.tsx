"use client";

import { useEffect, useMemo, useState } from "react";

interface Stat {
  id: string;
  name: string;
  value: number;
}
interface StatSession {
  id: string;
  title: string;
  stats: Stat[];
}
export default function Home() {
  const [sessions, setSessions] = useState<StatSession[]>([]);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number | null>(
    null,
  );
  const [newSessionIsOpen, setNewSessionIsOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");

  const [newStatIsOpen, setNewStatIsOpen] = useState(false);
  const [newStatName, setNewStatName] = useState("");
  const [newStatValue, setNewStatValue] = useState(0);

  const selectedSession = useMemo(() => {
    return selectedSessionIdx !== null ? sessions[selectedSessionIdx] : null;
  }, [selectedSessionIdx, sessions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessions = window.localStorage.getItem("sessions");
      const sessions: StatSession[] = storedSessions
        ? JSON.parse(storedSessions)
        : [];
      setSessions(sessions);

      return () => {
        window.localStorage.setItem("sessions", JSON.stringify(sessions));
      };
    }
  }, []);

  useEffect(() => {
    setNewSessionTitle("");
  }, [newSessionIsOpen]);

  function handleCreateSession() {
    const newSession: StatSession = {
      id: crypto.randomUUID(),
      title: newSessionTitle,
      stats: [],
    };
    setSessions([...sessions, newSession]);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "sessions",
        JSON.stringify([...sessions, newSession]),
      );
    }
    setNewSessionIsOpen(false);
  }

  function handleCreateNewStat() {
    const newStat: Stat = {
      id: crypto.randomUUID(),
      name: newStatName,
      value: newStatValue,
    };
    setSessions((prev) => {
      if (selectedSessionIdx !== null) {
        const newSessions = [...prev];
        newSessions[selectedSessionIdx] = {
          ...newSessions[selectedSessionIdx],
          stats: [...newSessions[selectedSessionIdx].stats, newStat],
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sessions", JSON.stringify(newSessions));
        }
        return newSessions;
      }
      return prev;
    });
    setNewStatIsOpen(false);
  }

  function changeStatName(statId: string, newName: string) {
    setSessions((prev) => {
      if (selectedSessionIdx !== null) {
        const newSessions = structuredClone(prev);
        newSessions[selectedSessionIdx].stats = newSessions[
          selectedSessionIdx
        ].stats.map((s) => {
          if (s.id === statId) {
            return { ...s, name: newName };
          }
          return s;
        });
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sessions", JSON.stringify(newSessions));
        }
        return newSessions;
      }
      return prev;
    });
  }

  function changeStatValue(statId: string, newValue: number) {
    setSessions((prev) => {
      if (selectedSessionIdx !== null) {
        const newSessions = structuredClone(prev);
        newSessions[selectedSessionIdx].stats = newSessions[
          selectedSessionIdx
        ].stats.map((s) => {
          if (s.id === statId) {
            return { ...s, value: newValue };
          }
          return s;
        });
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sessions", JSON.stringify(newSessions));
        }
        return newSessions;
      }
      return prev;
    });
  }

  function changeSessionTitle(newTitle: string) {
    setSessions((prev) => {
      if (selectedSessionIdx !== null) {
        const newSessions = structuredClone(prev);
        newSessions[selectedSessionIdx].title = newTitle;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sessions", JSON.stringify(newSessions));
        }
        return newSessions;
      }
      return prev;
    });
  }

  function downloadCsv() {
    if (!selectedSession) return;

    const csvRows = [];
    csvRows.push(["Name", "Value"]);

    selectedSession.stats.forEach((stat) => {
      csvRows.push([stat.name, stat.value]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedSession.title}_stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function duplicateSession() {
    if (!selectedSession) return;

    const duplicatedSession: StatSession = {
      id: crypto.randomUUID(),
      title: `${selectedSession.title} (Copy)`,
      stats: selectedSession.stats.map((stat) => ({
        ...stat,
        id: crypto.randomUUID(),
      })),
    };

    setSessions((prev) => {
      const newSessions = [...prev, duplicatedSession];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sessions", JSON.stringify(newSessions));
      }
      return newSessions;
    });
    setSelectedSessionIdx(sessions.length);
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Sessions</h2>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        {/* List */}
        <ul className="divide-y-2 py-2">
          <li>
            <button
              className="px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 w-full text-center"
              onClick={() => setNewSessionIsOpen(true)}
            >
              New Session
            </button>
          </li>
          {sessions.map((session, idx) => (
            <li key={session.id}>
              <button
                className="px-4 py-2 rounded-md hover:bg-white/10 w-full"
                onClick={() => setSelectedSessionIdx(idx)}
              >
                {session.title}
              </button>
            </li>
          ))}
        </ul>
        {/* Content */}
        <div className="p-4">
          {selectedSession ? (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mb-4">
                <input
                  type="text"
                  className="text-xl font-bold bg-transparent w-full md:w-auto"
                  value={selectedSession.title}
                  onChange={(e) => changeSessionTitle(e.target.value)}
                />
                <div className="flex gap-4 md:justify-end justify-start w-full">
                  <button
                    onClick={duplicateSession}
                    className="hover:underline text-sm md:text-base"
                  >
                    Duplicate Session
                  </button>
                  <button
                    onClick={downloadCsv}
                    className="hover:underline text-sm md:text-base"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
              <ul className="flex flex-wrap gap-4">
                {selectedSession.stats.map((stat) => (
                  <li
                    key={stat.id}
                    className="sm:w-48 w-full h-32 border grid grid-cols-[30px_1fr_30px]"
                  >
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-800 h-full flex items-center justify-center"
                      onClick={() => changeStatValue(stat.id, stat.value - 1)}
                    >
                      -
                    </button>
                    <div className="flex flex-col items-center justify-center px-2">
                      <input
                        type="text"
                        className="font-bold w-full text-center bg-transparent"
                        value={stat.name}
                        onChange={(e) =>
                          changeStatName(stat.id, e.target.value)
                        }
                      />
                      <input
                        type="number"
                        className="text-xl w-full text-center bg-transparent"
                        value={stat.value}
                        onChange={(e) =>
                          changeStatValue(stat.id, Number(e.target.value))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="bg-green-600 hover:bg-green-800 h-full flex items-center justify-center"
                      onClick={() => changeStatValue(stat.id, stat.value + 1)}
                    >
                      +
                    </button>
                  </li>
                ))}
                <li className="w-full sm:w-48">
                  <button
                    onClick={() => setNewStatIsOpen(true)}
                    className="w-full h-32 border"
                  >
                    New Stat
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <p>No session selected</p>
          )}
        </div>
      </div>

      {/* Modal  */}
      {newSessionIsOpen && (
        <div className="absolute w-screen h-screen left-0 top-0 bg-black/50">
          <div className="absolute top-1/2 left-1/2 w-[90%] md:w-[500px] -translate-x-1/2 -translate-y-1/2 bg-neutral-700 p-4 rounded-md">
            <h3 className="text-lg font-bold mb-4">New Session</h3>
            <form>
              <div>
                <label className="block">Title</label>
                <input
                  type="text"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="bg-white/30 rounded-sm p-2 w-full"
                />
              </div>
              <div className="flex gap-4 justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-500"
                  onClick={() => setNewSessionIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500"
                  onClick={handleCreateSession}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newStatIsOpen && (
        <div className="absolute w-screen h-screen left-0 top-0 bg-black/50">
          <div className="absolute top-1/2 left-1/2 w-[90%] md:w-[500px] -translate-x-1/2 -translate-y-1/2 bg-neutral-700 p-4 rounded-md">
            <h3 className="text-lg font-bold mb-4">New Stat</h3>
            <form>
              <div>
                <label className="block">Name</label>
                <input
                  type="text"
                  value={newStatName}
                  onChange={(e) => setNewStatName(e.target.value)}
                  className="bg-white/30 rounded-sm p-2 w-full"
                />
              </div>
              <div>
                <label className="block">Starting Value</label>
                <input
                  type="number"
                  value={newStatValue}
                  onChange={(e) => setNewStatValue(Number(e.target.value))}
                  className="bg-white/30 rounded-sm p-2 w-full"
                />
              </div>
              <div className="flex gap-4 justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-500"
                  onClick={() => setNewStatIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500"
                  onClick={handleCreateNewStat}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
