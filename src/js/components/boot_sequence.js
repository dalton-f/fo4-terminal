import { typer } from "./utils";

const terminal = document.getElementById("terminal");

export const bootSequence = () =>
  typer(terminal, {
    strings: [
      "Welcome to ROBCO Industries (TM) Termlink",
      ">SET TERMINAL/INQUIRE",
      "RX-9000",
      ">SET FILE/PROTECTION=OWNER:RWED ACCOUNTS.F",
      ">SET HALT RESTART/MAINT",
      "Initializing RobCo Industries(TM) MF Boot Agent v2.3.0",
      "RETRO BIOS",
      "RBIOS-4.02.08.00 52EE5.E7.E8",
      "Copyright 2075-2077 RobCo Ind.",
      "Uppermem: 1024 KB",
      "Root (5A8)",
      "Maintenance Mode",
      ">RUN DEBUG/ACCOUNTS.F",
    ],
    speed: 30,
    breakLines: true,
    waitUntilVisible: true,
    cursor: true,
  });
