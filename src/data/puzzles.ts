// Quiz and pole content. Shared by the frontend and by Convex (server-side scoring),
// so keep this file free of browser or React imports.
//
// Content notes: voltages and standards use Canadian (Prairie) practice:
// 25 kV class distribution (14.4 kV line-to-ground), CSA C22.3 No. 1 for overhead lines.
// Have a P.Eng. review any edits before an event.

export type Difficulty = "apprentice" | "technician" | "engineer" | "master";

export type Category =
  | "Pole anatomy"
  | "Line design"
  | "Safety"
  | "Circuits"
  | "Power systems";

export interface Puzzle {
  id: string;
  level: number;
  difficulty: Difficulty;
  category: Category;
  question: string;
  hint?: string;
  options: string[];
  correct: number;
  explanation: string;
  points: number;
}

export interface PoleComponent {
  id: string;
  /** Item number shown in the drawing balloon. */
  item: number;
  name: string;
  emoji: string;
  zone: string;
  description: string;
  detail: string;
  /** One line for the 3D view: what the animation is showing. */
  motion: string;
}

export const poleComponents: PoleComponent[] = [
  {
    id: "insulator",
    item: 1,
    name: "Insulator",
    emoji: "💎",
    zone: "Primary",
    description:
      "Holds the energized conductor and keeps current from tracking into the crossarm and pole. Porcelain, glass or polymer.",
    detail: "The skirts lengthen the surface path so rain and dirt can't bridge it easily.",
  motion: "Current runs past on the wire and none of it reaches the pole.",
  },
  {
    id: "crossarm",
    item: 2,
    name: "Crossarm",
    emoji: "➕",
    zone: "Primary",
    description:
      "Wood, steel or fibreglass arm that carries the phase conductors and sets the spacing between them.",
    detail: "Spacing is a design value. Too tight and conductors can clash in wind or when ice sheds.",
  motion: "Three phases, held apart at a fixed spacing.",
  },
  {
    id: "arrester",
    item: 3,
    name: "Surge arrester",
    emoji: "⚡",
    zone: "Equipment",
    description:
      "Sits beside equipment and diverts lightning and switching surges to ground before they damage it.",
    detail: "At normal voltage it behaves like an open circuit. It only conducts during an overvoltage.",
  motion: "Lightning hits the line and the surge is dumped to ground.",
  },
  {
    id: "fuse",
    item: 4,
    name: "Fused cutout",
    emoji: "🔒",
    zone: "Equipment",
    description:
      "A fuse and switch in one. It opens when fault current flows, isolating the transformer from the line.",
    detail: "When the fuse blows the barrel drops open, so a crew can spot it from the ground.",
  motion: "A fault melts the fuse and the barrel drops open.",
  },
  {
    id: "transformer",
    item: 5,
    name: "Distribution transformer",
    emoji: "🔋",
    zone: "Equipment",
    description:
      "Steps the primary voltage (14.4 kV line-to-ground on a 25 kV system) down to 120/240 V for homes and small businesses.",
    detail: "One pole-mount unit typically serves a handful of homes, or a single farmyard.",
  motion: "14.4 kV goes in the top. 120/240 V comes out the side.",
  },
  {
    id: "neutral",
    item: 6,
    name: "Neutral and secondary",
    emoji: "〰️",
    zone: "Secondary",
    description:
      "The neutral is the return path for load current. Below it, secondary conductors carry 120/240 V to the service drops.",
    detail: "The neutral is bonded to ground at many points along the line, which keeps it near earth potential.",
  motion: "Load current heads back to the source on the neutral.",
  },
  {
    id: "streetlight",
    item: 7,
    name: "Street light",
    emoji: "💡",
    zone: "Secondary",
    description: "Fed from the secondary. LED fixtures have replaced most high-pressure sodium lights.",
    detail: "A light adds wind load and a bracket moment the pole design has to account for.",
  motion: "Fed from the secondary, switched on at dusk.",
  },
  {
    id: "cablecom",
    item: 8,
    name: "Communication cables",
    emoji: "📡",
    zone: "Communication",
    description:
      "Telephone, cable TV and fibre owned by other companies. They attach in the communication space, below all power conductors.",
    detail: "A required gap separates them from the power space so telecom crews can work safely.",
  motion: "Data traffic, kept well below the power conductors.",
  },
  {
    id: "guy",
    item: 9,
    name: "Guy and anchor",
    emoji: "⚓",
    zone: "Structure",
    description:
      "A steel strand from the pole to a ground anchor. It balances the pull where a line ends or changes direction.",
    detail: "Without it, an angle or dead-end pole would lean over time or break at the ground line.",
  motion: "Line tension runs down the strand into the anchor.",
  },
];

export const poleZones: { zone: string; text: string }[] = [
  { zone: "Primary", text: "Phase conductors, 25 kV class" },
  { zone: "Equipment", text: "Transformer, cutout, arrester" },
  { zone: "Secondary", text: "Neutral, 120/240 V, street lights" },
  { zone: "Communication", text: "Telephone, cable, fibre" },
  { zone: "Structure", text: "Pole, guys, anchors, grounding" },
];

export const puzzles: Puzzle[] = [
  // ── Apprentice ──────────────────────────────────────────────────────────
  {
    id: "p1",
    level: 1,
    difficulty: "apprentice",
    category: "Pole anatomy",
    question: "Which device on a pole steps the line voltage down for use in a home?",
    options: ["Insulator", "Transformer", "Fused cutout", "Surge arrester"],
    correct: 1,
    explanation:
      "The distribution transformer takes the primary voltage (14,400 V on many Prairie feeders) down to 120/240 V.",
    points: 100,
  },
  {
    id: "p2",
    level: 1,
    difficulty: "apprentice",
    category: "Pole anatomy",
    question: "Why do conductors sit on insulators instead of being bolted straight to the crossarm?",
    options: [
      "To hold the wires level",
      "To stop current from flowing into the structure",
      "To protect against lightning",
      "To measure voltage",
    ],
    correct: 1,
    explanation:
      "Insulators are porcelain, glass or polymer. They support the conductor while keeping current out of the arm and pole.",
    points: 100,
  },
  {
    id: "p21",
    level: 2,
    difficulty: "apprentice",
    category: "Line design",
    question: "A line ends at a pole. What is the steel guy wire running down to the ground for?",
    options: [
      "It grounds the transformer",
      "It balances the pull of the conductors",
      "It carries the neutral current",
      "It stops vehicles hitting the pole",
    ],
    correct: 1,
    explanation:
      "At a dead-end or an angle, conductor tension pulls one way. The guy and anchor pull back so the pole isn't bent.",
    points: 100,
  },
  {
    id: "p22",
    level: 2,
    difficulty: "apprentice",
    category: "Line design",
    question: "ACSR is the most common overhead conductor. What does it stand for?",
    options: [
      "Aluminum Conductor Steel Reinforced",
      "Alternating Current Standard Rated",
      "Aluminum Copper Stranded Round",
      "Aerial Cable Service Rated",
    ],
    correct: 0,
    explanation:
      "Aluminum strands carry the current. The steel core carries the tension, which lets the line span farther.",
    points: 100,
  },
  {
    id: "p3",
    level: 3,
    difficulty: "apprentice",
    category: "Pole anatomy",
    question: "Which of these is normally attached lowest on a shared pole?",
    options: ["Primary phase conductor", "Secondary conductor", "Neutral", "Communication cable"],
    correct: 3,
    explanation:
      "Communication cables sit in their own space at the bottom. Power conductors go above, with the highest voltage at the top.",
    points: 100,
    hint: "Voltage goes up as you go up the pole.",
  },
  {
    id: "p4",
    level: 4,
    difficulty: "apprentice",
    category: "Circuits",
    question: "A 120 V source feeds a 60 Ω resistor. What current flows?",
    options: ["0.5 A", "1 A", "2 A", "3 A"],
    correct: 2,
    explanation: "Ohm's law: I = V / R = 120 / 60 = 2 A.",
    points: 150,
    hint: "Divide voltage by resistance.",
  },
  {
    id: "p5",
    level: 4,
    difficulty: "apprentice",
    category: "Pole anatomy",
    question: "What does a fused cutout do?",
    options: [
      "Boosts voltage when demand is low",
      "Opens the circuit when fault current flows",
      "Converts AC to DC",
      "Meters energy use",
    ],
    correct: 1,
    explanation:
      "It protects the transformer and the line. When the fuse link melts, the barrel drops open and isolates the fault.",
    points: 150,
  },
  {
    id: "p23",
    level: 5,
    difficulty: "apprentice",
    category: "Line design",
    question: "It's 35 °C and the line is heavily loaded. What happens to the conductor sag?",
    options: [
      "It decreases, the wire tightens",
      "It increases, the wire hangs lower",
      "Nothing, sag is fixed at install",
      "It only changes with wind",
    ],
    correct: 1,
    explanation:
      "Hot conductors expand and hang lower. Designers check ground clearance at the maximum conductor temperature for that reason.",
    points: 150,
  },

  // ── Technician ──────────────────────────────────────────────────────────
  {
    id: "p6",
    level: 6,
    difficulty: "technician",
    category: "Circuits",
    question: "A load draws 20 A at 120 V. How much power is that?",
    options: ["600 W", "1,200 W", "2,400 W", "4,800 W"],
    correct: 2,
    explanation: "P = V × I = 120 × 20 = 2,400 W. That's roughly one large stove element.",
    points: 200,
  },
  {
    id: "p7",
    level: 6,
    difficulty: "technician",
    category: "Power systems",
    question: "Which of these is a typical primary distribution voltage in Western Canada?",
    options: ["240 V", "600 V", "25 kV", "500 kV"],
    correct: 2,
    explanation:
      "25 kV class is common across the Prairies. 240 V and 600 V are utilization voltages, and 500 kV is bulk transmission.",
    points: 200,
  },
  {
    id: "p8",
    level: 7,
    difficulty: "technician",
    category: "Safety",
    question: "Why is the system neutral grounded at many points along a distribution line?",
    options: [
      "To raise the line voltage",
      "To hold it near earth potential and give fault current a path back",
      "To stop lightning from striking",
      "To make the line reach farther",
    ],
    correct: 1,
    explanation:
      "A multi-grounded neutral stays close to earth potential, which limits touch voltage and helps protection operate quickly.",
    points: 200,
  },
  {
    id: "p24",
    level: 7,
    difficulty: "technician",
    category: "Line design",
    question: "Two wood poles are the same length. One is Class 2 and one is Class 5. Which is stronger?",
    options: ["Class 5", "Class 2", "They're equal, class is about treatment", "It depends on species only"],
    correct: 1,
    explanation:
      "Lower class numbers mean a larger circumference and a higher rated load. A Class 2 pole carries more than a Class 5.",
    points: 200,
    hint: "Think of it like wire gauge.",
  },
  {
    id: "p25",
    level: 8,
    difficulty: "technician",
    category: "Line design",
    question:
      "A common rule of thumb sets a pole 10% of its length plus 0.6 m into the ground. How deep for a 12.2 m (40 ft) pole?",
    options: ["About 1.2 m", "About 1.8 m", "About 2.4 m", "About 3.0 m"],
    correct: 1,
    explanation:
      "10% of 12.2 m is 1.22 m. Add 0.6 m and you get about 1.8 m. Soil conditions can call for more.",
    points: 200,
  },
  {
    id: "p26",
    level: 8,
    difficulty: "technician",
    category: "Pole anatomy",
    question: "During normal operation, how does a surge arrester behave?",
    options: [
      "Like a closed switch to ground",
      "Like an open circuit",
      "Like a small transformer",
      "Like a fuse in series with the line",
    ],
    correct: 1,
    explanation:
      "It conducts almost nothing at normal voltage. During a surge its resistance collapses and it clamps the voltage.",
    points: 200,
  },
  {
    id: "p9",
    level: 9,
    difficulty: "technician",
    category: "Circuits",
    question: "A 25 kVA single-phase transformer has a 14.4 kV primary. What is the full-load primary current?",
    options: ["0.58 A", "1.74 A", "17.4 A", "360 A"],
    correct: 1,
    explanation:
      "I = S / V = 25,000 / 14,400 ≈ 1.74 A. High voltage means low current, and low current means low line loss.",
    points: 250,
    hint: "Current = VA ÷ volts.",
  },
  {
    id: "p27",
    level: 9,
    difficulty: "technician",
    category: "Line design",
    question: "A line turns 90° at a corner. What kind of structure belongs there?",
    options: [
      "A standard tangent pole",
      "A guyed angle or dead-end structure",
      "A shorter pole to reduce wind load",
      "Any pole, direction doesn't matter",
    ],
    correct: 1,
    explanation:
      "Tangent poles only carry straight-through loads. At a corner the conductor tensions don't cancel, so the pole needs guys.",
    points: 250,
  },
  {
    id: "p10",
    level: 10,
    difficulty: "technician",
    category: "Circuits",
    question: "What is the power factor of a purely resistive load?",
    options: ["0", "0.5", "0.707", "1.0"],
    correct: 3,
    explanation: "Voltage and current are in phase, so PF = cos 0° = 1.0. There is no reactive power.",
    points: 250,
  },

  // ── Engineer ────────────────────────────────────────────────────────────
  {
    id: "p11",
    level: 11,
    difficulty: "engineer",
    category: "Circuits",
    question: "A branch circuit carries 15 A through a total conductor resistance of 0.16 Ω. What is the voltage drop?",
    options: ["1.2 V", "2.4 V", "4.8 V", "9.6 V"],
    correct: 1,
    explanation: "V = I × R = 15 × 0.16 = 2.4 V, which is 2% of a 120 V circuit.",
    points: 300,
    hint: "V = I × R.",
  },
  {
    id: "p28",
    level: 11,
    difficulty: "engineer",
    category: "Line design",
    question: "Which standard covers the design of overhead lines in Canada?",
    options: [
      "CSA C22.1, Canadian Electrical Code Part I",
      "CSA C22.3 No. 1, Overhead systems",
      "CSA Z462, Workplace electrical safety",
      "CSA Z94.3, Eye and face protectors",
    ],
    correct: 1,
    explanation:
      "CSA C22.3 No. 1 sets clearances, loadings and strength requirements for overhead lines. C22.1 covers building wiring.",
    points: 300,
  },
  {
    id: "p29",
    level: 12,
    difficulty: "engineer",
    category: "Line design",
    question: "Wind pushes on a pole and its conductors. Where is the bending stress in an unguyed pole usually highest?",
    options: ["At the top", "At the crossarm", "Near the ground line", "It's uniform along the pole"],
    correct: 2,
    explanation:
      "The pole acts as a cantilever fixed in the ground. Bending moment grows toward the ground line, where most failures occur.",
    points: 300,
  },
  {
    id: "p12",
    level: 12,
    difficulty: "engineer",
    category: "Power systems",
    question: "A balanced three-phase feeder is 25 kV line-to-line. What is the line-to-ground voltage?",
    options: ["8.3 kV", "14.4 kV", "25 kV", "43.3 kV"],
    correct: 1,
    explanation: "V(line-ground) = V(line-line) ÷ √3 = 25 ÷ 1.732 ≈ 14.4 kV. That's where the 14.4/25 kV rating comes from.",
    points: 350,
    hint: "Divide by √3.",
  },
  {
    id: "p13",
    level: 13,
    difficulty: "engineer",
    category: "Circuits",
    question: "An inductor has 10 Ω of reactance at 60 Hz. What is its reactance at 120 Hz?",
    options: ["5 Ω", "10 Ω", "20 Ω", "100 Ω"],
    correct: 2,
    explanation: "X = 2πfL, so reactance scales with frequency. Double the frequency and you get 20 Ω.",
    points: 350,
  },
  {
    id: "p30",
    level: 13,
    difficulty: "engineer",
    category: "Line design",
    question: "You double a span length and keep the conductor tension the same. What happens to the sag?",
    options: ["It doubles", "It triples", "It goes up four times", "It stays the same"],
    correct: 2,
    explanation:
      "Sag ≈ wL² / 8T. Sag depends on span length squared, so twice the span gives four times the sag.",
    points: 350,
    hint: "Sag varies with the square of the span.",
  },
  {
    id: "p14",
    level: 14,
    difficulty: "engineer",
    category: "Circuits",
    question: "A motor draws 10 kVA at 0.8 power factor. What is the real power?",
    options: ["6 kW", "8 kW", "10 kW", "12 kW"],
    correct: 1,
    explanation: "P = S × PF = 10 × 0.8 = 8 kW. The remaining 6 kvar loads the conductors without doing work.",
    points: 400,
    hint: "P = S × cos θ.",
  },
  {
    id: "p15",
    level: 15,
    difficulty: "engineer",
    category: "Safety",
    question: "A storm has dropped a power line across the road in front of you. What do you do?",
    options: [
      "Move it aside with a dry stick",
      "Drive over it slowly",
      "Assume it's live, stay at least 10 m back and call the utility",
      "Touch it briefly to check if it's energized",
    ],
    correct: 2,
    explanation:
      "A downed line can be energized with no sparks or sound, and the ground around it can be energized too. Stay back and call it in.",
    points: 400,
  },

  // ── Master ──────────────────────────────────────────────────────────────
  {
    id: "p16",
    level: 16,
    difficulty: "master",
    category: "Power systems",
    question:
      "A 50 kVA, 240 V secondary transformer has 2% impedance. Roughly what is the bolted fault current at its terminals, assuming an infinite source?",
    options: ["208 A", "2,083 A", "10,417 A", "41,667 A"],
    correct: 2,
    explanation:
      "Rated current is 50,000 / 240 ≈ 208 A. Divide by 0.02 per unit impedance and you get about 10,400 A.",
    points: 500,
    hint: "I(fault) = I(rated) ÷ Z(per unit).",
  },
  {
    id: "p17",
    level: 17,
    difficulty: "master",
    category: "Power systems",
    question: "For the same power delivered, why does doubling the line voltage cut resistive losses to a quarter?",
    options: [
      "Higher voltage means more current",
      "Current halves, and loss is I²R",
      "Conductor resistance falls at high voltage",
      "Higher voltage shields the conductor magnetically",
    ],
    correct: 1,
    explanation: "P = VI, so doubling V halves I. Loss = I²R, and (I/2)² is a quarter of I².",
    points: 500,
  },
  {
    id: "p18",
    level: 18,
    difficulty: "master",
    category: "Power systems",
    question: "On a 100 MVA, 115 kV base, what is the base impedance?",
    options: ["0.132 Ω", "13.2 Ω", "132.25 Ω", "1,322.5 Ω"],
    correct: 2,
    explanation: "Z(base) = kV² / MVA = 115² / 100 = 132.25 Ω.",
    points: 600,
    hint: "Z(base) = kV² ÷ MVA.",
  },
  {
    id: "p19",
    level: 19,
    difficulty: "master",
    category: "Power systems",
    question: "Which sequence networks are involved in a single line-to-ground fault?",
    options: [
      "Positive only",
      "Positive and negative, in series",
      "Positive, negative and zero, in series",
      "Zero only",
    ],
    correct: 2,
    explanation:
      "All three sequence networks connect in series for a single line-to-ground fault. It's the starting point for ground relay settings.",
    points: 600,
  },
  {
    id: "p20",
    level: 20,
    difficulty: "master",
    category: "Power systems",
    question: "Skin effect pushes AC current toward a conductor's surface. Roughly what is the skin depth of copper at 60 Hz?",
    options: ["0.85 mm", "8.5 mm", "85 mm", "850 mm"],
    correct: 1,
    explanation:
      "About 8.5 mm. It's one reason large conductors are stranded or built around a core that carries little current.",
    points: 750,
    hint: "δ = √(ρ / (π f μ)).",
  },
];

export const puzzleById: Record<string, Puzzle> = Object.fromEntries(puzzles.map((p) => [p.id, p]));

export const difficultyConfig: Record<Difficulty, { label: string }> = {
  apprentice: { label: "Apprentice" },
  technician: { label: "Technician" },
  engineer: { label: "Engineer" },
  master: { label: "Master" },
};
