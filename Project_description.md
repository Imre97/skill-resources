Projekt neve: Nexus Skill & Resource Planner

1. Fő célkitűzés
   Egy olyan transzparens felület létrehozása, ahol a menedzsment látja a fejlesztők aktuális leterheltségét, technikai tudását (Skill Matrix), és ezek alapján optimálisan tudja őket projektekhez rendelni.

2. Kulcsfunkciók (Amiért felvesznek)
   A. Interaktív Skill Matrix (Radar Chart)
   Minden fejlesztőhöz tartozik egy profil, ahol 1-5-ig pontozva vannak a képességei (pl. React, Node.js, AWS, TypeScript, Testing).

Frontend kihívás: Egy Radar Chart (vagy Spider Chart), ami vizuálisan összehasonlíthatóvá teszi a jelölteket.

Feature: Lehessen szűrni: "Mutasd azokat a fejlesztőket, akiknek a React tudása legalább 4-es".

B. Drag-and-Drop Erőforrás Ütemező (Timeline)
Egy vízszintes idősáv (Gantt-szerű nézet), ahol a bal oldalon a fejlesztők névsora van, a jobb oldalon pedig az idővonal.

Frontend kihívás: Használj dnd-kit-et vagy react-beautiful-dnd-t. A projekt-blokkokat lehessen mozgatni a fejlesztők között.

Feature: Ha egy fejlesztő napi 8 óránál több feladatot kap, a sávja váltson át pirosra (Overload warning).

C. Csapat-összeállítási szimulátor
Egy funkció, ahol kiválaszthatsz egy projektet (pl. "Új Banki App"), és az alkalmazás megmutatja, kik a legalkalmasabbak rá a képességeik alapján.

Frontend kihívás: Egy "Match Score" algoritmus vizuális megjelenítése (pl. "85% match with this project's requirements").
