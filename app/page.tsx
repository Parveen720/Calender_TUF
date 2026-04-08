"use client";
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<number | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [currentNote, setCurrentNote] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const startDay = getDay(start); // 0 = Sunday
  const offset = startDay === 0 ? 6 : startDay - 1; // Monday start fix
  const monthLabel = format(currentDate, "MMMM yyyy");
  const [mode, setMode] = useState<"theme1" | "theme2">("theme1");
  const holidays = [
    "2026-01-26", // Republic Day
    "2026-08-15", // Independence Day
    "2026-10-02", // Gandhi Jayanti
  ];

  const [noteType, setNoteType] = useState<{ [key: string]: string }>({});
  const [activeDate, setActiveDate] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  //NEW: key generator (month + date)
  function getNoteKey(day: number | null) {
    const monthKey = format(currentDate, "yyyy-MM");

    if (day) return `${monthKey}-${day}`; // date note
    return `${monthKey}-month`; // month note
  }

  function handleDateClick(day: number) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  }

  //For SAVE NOTES
  function saveNote() {
    let key;

    if (startDate && !endDate) {
      key = getNoteKey(startDate);
    } else {
      key = getNoteKey(null);
    }

    setNotes((prev) => ({
      ...prev,
      [key]: currentNote,
    }));
  }

  function nextMonth() {
    setDirection(1);
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    setStartDate(null);
    setEndDate(null);
  }

  function prevMonth() {
    setDirection(-1);
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    setStartDate(null);
    setEndDate(null);
  }


  function setType(day: number, type: string) {
    const key = `${format(currentDate, "yyyy-MM")}-${day}`;

    setNoteType((prev) => ({
      ...prev,
      [key]: type,
    }));

    setActiveDate(null);
  }

  function removeType(day: number) {
    const key = `${format(currentDate, "yyyy-MM")}-${day}`;

    setNoteType((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

    setActiveDate(null);
  }

  useEffect(() => {
    let key;

    if (startDate && !endDate) {
      key = getNoteKey(startDate); // single date
    } else {
      key = getNoteKey(null); // month
    }

    setCurrentNote(notes[key] || "");
  }, [startDate, endDate, currentDate]);

  useEffect(() => {
    const saved = localStorage.getItem("calendar-notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("calendar-notes", JSON.stringify(notes));
  }, [notes]);


  return (
    <main className="min-h-screen w-full bg-gray-100 p-4 md:p-10 flex flex-col items-center">

      {/* Nail */}
      <div className="flex flex-col items-center mb-1 relative">
        <div className="absolute top-1 w-6 h-9 bg-black/20 blur-md rounded-full"></div>

        <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-700 border border-gray-500 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white/70 rounded-full absolute top-1 left-1"></div>

          <div className="absolute top-full left-1/2 -translate-x-1/2">
            <div className="absolute left-1/2 -translate-x-1/2 w-[3px] h-6 bg-black/10 blur-sm"></div>
            <div className="w-[2px] h-6 bg-gradient-to-b from-gray-500 via-gray-300 to-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Spiral */}
      <div className="flex justify-center -mt-1 mb-2 relative z-10">
        <div className="flex gap-[3px]">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="w-[6px] h-[20px] border-t-2 border-gray-700 rounded-t-full"></div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-5xl mt-1 perspective-[1200px]">

          <div className="absolute top-4 left-4 w-full h-full bg-white rounded-2xl shadow-md opacity-50"></div>
          <div className="absolute top-2 left-2 w-full h-full bg-white rounded-2xl shadow-lg opacity-60"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDate.toISOString()}
              initial={{
                rotateX: direction === 1 ? 90 : -90,
                transformOrigin: "top center",
                opacity: 0.7,
                scale: 0.98
              }}
              animate={{
                rotateX: 0,
                opacity: 1,
                scale: 1
              }}
              exit={{
                rotateX: direction === 1 ? -90 : 90,
                opacity: 0.7,
                scale: 0.98
              }}
              transition={{
                duration: 0.6,
                ease: [0.33, 1, 0.68, 1]
              }}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
            >

              {/* Hero */}
              <div className="relative h-60 w-full overflow-hidden">
                <button
                  onClick={() => setMode(mode === "theme1" ? "theme2" : "theme1")}
                  className="absolute top-3 right-3 bg-white/30 backdrop-blur px-3 py-1 rounded-md text-white text-xs"
                >
                  Theme
                </button>
                <img
                  src={
                    mode === "theme1"
                      ? "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
                      : "https://images.unsplash.com/photo-1519681393784-d120267933ba"
                  }
                  className="w-full h-full object-cover"
                />



                <div className="absolute bottom-4 right-4 px-4 py-2
               bg-white/20 backdrop-blur-md border border-white/30
               rounded-xl shadow-md flex items-center gap-3 text-white text-sm">

                  <button
                    onClick={prevMonth}
                    className="hover:scale-110 transition duration-200"
                  >
                    ⬅
                  </button>

                  <span className="font-semibold tracking-wide">
                    {monthLabel}
                  </span>

                  <button
                    onClick={nextMonth}
                    className="hover:scale-110 transition duration-200"
                  >
                    ➡
                  </button>

                </div>
              </div>

              {/* Bottom */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
                {/* Notes */}
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-gray-500">
                    NOTES
                  </h2>

                  <textarea
                    className="w-full h-40 px-4 pt-[1px] text-black text-sm leading-[22px] outline-none resize-none
                   bg-[repeating-linear-gradient(to_bottom,transparent,transparent_21px,#d1d5db_22px)]"
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                  />

                  <button
                    onClick={saveNote}
                    className={`w-full text-white py-2 rounded-lg ${mode === "theme1" ? "bg-blue-500" : "bg-purple-500"
                      }`}
                  >
                    Save
                  </button>
                  <div className="flex justify-center gap-4 mt-2 text-xs items-center">

                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${mode === "theme1" ? "bg-blue-500" : "bg-purple-500"
                        }`}></span>
                      Personal
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Work
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Urgent
                    </div>

                  </div>
                </div>

                {/* Calendar */}
                <div className="md:col-span-2 p-2">
                  <div className="grid grid-cols-7 text-xs text-black mb-2">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => (
                      <div
                        key={d}
                        className={`text-center ${i === 6 ? "text-red-500" : "text-black"
                          }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">

                    {/* Empty spaces for correct alignment */}
                    {Array.from({ length: offset }).map((_, i) => (
                      <div key={"empty-" + i}></div>
                    ))}
                    {days.map((dateObj, i) => {
                      const day = dateObj.getDate();
                      const today = new Date();
                      const isToday =
                        dateObj.getDate() === today.getDate() &&
                        dateObj.getMonth() === today.getMonth() &&
                        dateObj.getFullYear() === today.getFullYear();

                      const key = `${format(currentDate, "yyyy-MM")}-${day}`;
                      const hasNote = !!notes[key];
                      const isPreview =
                        startDate &&
                        !endDate &&
                        hoverDate &&
                        day >= Math.min(startDate, hoverDate) &&
                        day <= Math.max(startDate, hoverDate);

                      const isInRange =
                        startDate &&
                        endDate &&
                        day >= startDate &&
                        day <= endDate;
                      const dateKey = `${format(currentDate, "yyyy-MM")}-${day}`;
                      const hasEvent = !!notes[dateKey];
                      const fullDate = format(dateObj, "yyyy-MM-dd");

                      // Saturday (6) & Sunday (0)
                      const isSunday = dateObj.getDay() === 0;

                      // Fixed holidays
                      const isHoliday = holidays.includes(fullDate);

                      // Final red condition
                      const isRedDay = isSunday || isHoliday;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            handleDateClick(day);
                            setHoverDate(null);
                          }}
                          onDoubleClick={() => setActiveDate(day)}
                          onMouseEnter={() => {
                            if (isMouseDown) setHoverDate(day);
                          }}
                          onMouseDown={() => setIsMouseDown(true)}
                          onMouseUp={() => setIsMouseDown(false)}
                          onMouseLeave={() => setIsMouseDown(false)}

                          className={`${noteType[dateKey] === "personal"
                            ? mode === "theme1"
                              ? "bg-blue-500 text-white"
                              : "bg-purple-500 text-white"
                            : ""}
                            ${noteType[dateKey] === "work" ? "bg-green-500 text-white" : ""}
                            ${noteType[dateKey] === "urgent" ? "bg-red-500 text-white" : ""}
                            p-2 text-center rounded-full cursor-pointer 
                            ${isRedDay ? "text-red-500" : "text-black"} transition-all

                             ""
                        ${isToday ? (
                              mode === "theme1"
                                ? "ring-2 ring-blue-600 font-bold"
                                : "ring-2 ring-purple-600 font-bold"
                            ) : ""}
                        ${isInRange ? "bg-blue-400 text-white" : ""}              
                        ${isPreview ? "bg-blue-100" : ""}

                         hover:bg-blue-200
                         `}
                        >
                          <div className="flex flex-col items-center relative">
                            <span>{day}</span>

                            {hasEvent && (
                              <span
                                className={`w-1.5 h-1.5 shadow-md rounded-full mt-1 ${mode === "theme1" ? "bg-blue-500" : "bg-purple-500"
                                  }`}
                              ></span>
                            )}
                            {activeDate === day && (
                              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-md p-2 flex gap-2 z-50">

                                {/* Personal */}
                                <button
                                  onClick={() => setType(day, "personal")}
                                  className={`text-lg ${mode === "theme1" ? "text-blue-500" : "text-purple-500"
                                    }`}
                                >
                                  ●
                                </button>

                                {/* Work */}
                                <button
                                  onClick={() => setType(day, "work")}
                                  className="text-green-500 text-lg"
                                >
                                  ●
                                </button>

                                {/* Urgent */}
                                <button
                                  onClick={() => setType(day, "urgent")}
                                  className="text-red-500 text-lg"
                                >
                                  ●
                                </button>

                                {/* REMOVE BUTTON */}
                                <button
                                  onClick={() => removeType(day)}
                                  className="text-gray-500 text-lg ml-1"
                                >
                                  ✕
                                </button>

                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-3 right-4 text-xs text-gray-400 opacity-70 pointer-events-none">
        © Parveen Kumar
      </div>
    </main>
  );
}
