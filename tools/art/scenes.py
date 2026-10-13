"""One diorama scene per cover: the hero, every part and every lesson of content/course.json.

Concrete objects only, never text in the scene. Recurring props: a glass box is a VM, a vault holds secrets,
a conveyor with gates is CI checks, a round table is planning, cables are networks, a tiny cloud island is AWS,
a lighthouse is telemetry, an hourglass with a sleeping robot is Temporal waiting, a magnifying glass is review,
a snake-shaped soft toy is Python. Prompts must never contain "@" (the CLI reads it as a file reference).
"""

ACCENT = {
  'silver': 'cool silver-blue',
  'sky': 'sky blue',
  'violet': 'violet and electric blue',
  'amber': 'warm amber gold',
  'teal': 'teal and mint',
  'coral': 'warm coral orange',
  'mint': 'fresh lime green',
}
HERO_ACCENT = 'soft rainbow of silver-blue, sky blue, violet, amber, teal, coral and lime'

SCENES = {
  'hero': 'a wide floating island world: a glowing path winds from left to right through small connected zones, a plain glowing start arch with nothing written on it, no signs, no writing on the arch, a server tower with cables, a conveyor with glass gates, a tiny cloud island, a harbour of stacked containers, a lighthouse, a large hourglass, a glass box with a robot inside, a round planning table and a small mountain with a golden flag at the far right; several robots and small clay people walk along the path. Very wide composition with the island spread across the whole frame.',

  # Parts
  'p0': 'a friendly welcome gate with a glowing arch; the robot holds a rolled blueprint with a winding path drawn on it while two engineers look at a small model of the whole island world on a table.',
  'p1': 'the robot lifts a glowing hexagon block out of a small browser-window frame and carries it toward a tidy server tower and a terminal screen; a coiled cable and a small toolbox sit on the desk.',
  'p2': 'a small workshop where blocks ride a conveyor through three glass gates with green lights; a robot wearing a round badge pulls a lever and a board of coloured pegs shows the rules; an engineer stamps an approved block.',
  'p3': 'a tiny cloud island floating beside the platform with a few small server boxes, a round bucket and cables between them; the robot, the small friendly white robot with a rounded head and a single glowing visor strip instead of eyes, plants a small flag on the island while an engineer looks through a spyglass.',
  'p4': 'the robot at a drafting table draws a glowing blueprint and a small crane machine builds a miniature cloud island next to it block by block from the drawing; an engineer checks the finished part against the sheet.',
  'p5': 'a miniature harbour of stacked shipping containers, each group inside a clear glass pod; a small ship wheel on a post; the robot operates a tiny crane and an engineer holds a clipboard.',
  'p6': 'a small lighthouse on the platform sweeps a soft beam over a row of gauges and a wall of glowing bar charts; the robot adjusts a dial and an engineer watches a dashboard panel.',
  'p7': 'a large hourglass with the robot curled asleep inside the top bulb while sand falls; beside it a calendar wheel and a small bell on a post; an engineer waits on a bench with a cup of tea.',
  'p8': 'the robot stands with an open glass panel on its chest showing small glowing gears, a memory crystal and a belt of tiny tools; an engineer adjusts it with a screwdriver; low glowing walls mark a safe lane around it.',
  'p9': 'three small kiosks, one topped with a chat bubble shape, one with a ticket board of coloured cards and one with a little pull-request tree of branches, all joined by glowing cables to the robot in the middle.',
  'p10': 'the robot hugs a snake-shaped soft toy while sitting on a short bridge between two desks; one desk has a blue block, the other a yellow one; an engineer waves from the second desk.',
  'p11': 'the robot works behind a sturdy low wall with rounded battlements; outside the wall a closed vault with a shield and an engineer guard; no keys anywhere near the robot; soft night light.',
  'p12': 'a shelf of glowing cartridges in different shapes; the robot slots one into a port on its back; beside it a test bench with gauges and two trays, green and amber; an engineer takes notes.',
  'g0': 'a sturdy front door with a big lock and a badge reader; the robot wears a round ID badge; an engineer guard checks it; a closed vault and a glowing shield stand beside the door.',
  'g1': 'a lighthouse sweeps its beam over a wall of four glowing dashboard panels of bars and lines; a small balance scale with coins sits in front; the robot and an engineer point at a rising line.',
  'g2': 'a conveyor carries code blocks through a tall glass review gate; the robot holds a large magnifying glass over one block; green and amber lights on the gate; an engineer with a stamp waits at the end.',
  'g3': 'a tiny cloud island holds a clear glass box with the robot working inside; cables run from the box to a small broker tower with a shield; an hourglass stands nearby; a lighthouse glows at the edge.',
  'g4': 'a glowing ticket card enters a small machine on the left, the robot works inside a glass window, and a wrapped gift box comes out on the right through a gate with green lights; an engineer holds a stamp.',
  'g5': 'a night scene with a crescent moon; a small crew of robots sweeps the floor, waters a plant and fixes a lamp while an engineer sleeps at a desk; a tidy row of glowing lanterns.',
  'g6': 'a round library with crystal shelves and a glowing brain made of light threads in the center; robots place memory crystals on shelves; an engineer reads a card from a small index drawer.',
  'g7': 'a fast conveyor of small test blocks racing through glass gates with green lights; a large stopwatch on a post; the robot gives a thumbs up and an engineer watches a timer.',
  'g8': 'a small market stall of glowing cartridges and tools; the robot hands one to an engineer; a tiny classroom of benches with small people sits beside it facing a blank glowing board.',

  # p0 Start here
  'p0-1': 'the robot shows an engineer a small open book with four glowing tiles: a picture, a block of code, a tiny workbench and a green check light; a small map board with pins hangs behind them.',
  'p0-2': 'a single large glowing drawing board on an easel shows a tiny glass box, a tower, a gate, an hourglass and low walls connected by lines; the robot points with a long pointer; two engineers look on.',
  'p0-3': 'a short staircase of nine glowing steps climbs the platform, each step a slightly different colour; a small calendar wheel stands beside it; the robot and an engineer stand on the first step.',
  'p0-4': 'a row of seven small glowing doors, each a different colour; the robot holds a card with four stacked blank panels; an engineer opens one door to reveal shelves of folders.',

  # p1 Node and TypeScript
  'p1-1': 'the robot plugs a glowing hexagon block into a small workbench with neat drawers; a few packages wrapped in paper with pin-shaped seals sit in a row; an engineer turns a tiny crank.',
  'p1-2': 'a small desk where the robot reads from a folder and pours glowing beads through a clear pipe into another folder; a second small machine runs beside it behind a safety glass panel.',
  'p1-3': 'a tiny post office counter: the robot sorts incoming envelopes into three slots, stamps them with coloured round stamps, and a measuring gate stops one envelope that is too fat.',
  'p1-4': 'the robot drops a glowing token into a small grinder that turns it into an unreadable grey pebble; a closed vault behind it; a notebook on the desk is firmly closed with a clasp.',
  'p1-5': 'the robot holds a stencil shaped like a puzzle piece over a stream of soft blocks; the blocks that fit pass, the wrong shapes drop into a bin; an engineer holds a matching blueprint.',
  'p1-6': 'a small test bench where the robot presses buttons on a panel of green lights; a cardboard cut-out of a tiny cloud island stands in for the real one; an engineer ticks a clipboard.',
  'p1-7': 'the robot squeezes a pile of many small blocks through a glass funnel into one neat glowing bar; a small ribbon ties the bar; a tiny rocket stand waits to carry it.',
  'p1-8': 'the robot locks a small sealed shipping container with a padlock; a thin slender base plate sits under it; a tiny guard rail keeps the container from being opened from the inside.',

  # p2 GitHub as a platform
  'p2-1': 'a simple conveyor with three stations: a bell that starts the belt, a worker robot at a bench, and a glass gate with a green light; an engineer pushes the start button.',
  'p2-2': 'two small workshops share one blueprint through a glowing cable; the blueprint is pinned with a round wax seal; a robot works inside a sealed glass container on a conveyor.',
  'p2-3': 'the robot stops a suspicious red-glowing envelope at a glass hatch while a clean one passes; a small badge station hands out short glowing tickets; a vault and a cloud island in the background.',
  'p2-4': 'a tiny robot wearing a round badge receives a small glowing key that fades like a candle; a gate with a lock needs two engineers to each turn a key before it opens.',
  'p2-5': 'the robot speaks through a glowing tube to a small branching tree of pull-request cards; it reads cards with green and amber lights and opens a new card marked with a faint draft outline.',
  'p2-6': 'a calendar wheel turns once a month while the robot bundles a few wrapped packages into one tidy box; an old weekly alarm clock sits switched off in a corner.',

  # p3 AWS
  'p3-1': 'a tiny cloud island with several small fenced yards; the robot gives a machine a tiny key ring with only one key; an engineer holds a card grid of who may open which yard.',
  'p3-2': 'a cloud island surrounded by a soft glass wall with no gate; cables from inside reach small glowing portholes in the wall that lead to a bucket and a server box outside.',
  'p3-3': 'the robot chooses between three machine boxes of different sizes on a shelf, stamps a clean image onto one, and closes a small hatch on its side with a lock.',
  'p3-4': 'a row of machines resting under soft blankets in a warm pool of light; the robot wakes one with a tiny bell; a bargain bin of cheaper machines with price-tag shapes beside it.',
  'p3-5': 'the robot sends a glowing paper plane through a small window to a machine inside a glass yard; no door or ladder reaches the machine; a tiny lamp keeps a long job burning.',
  'p3-6': 'a round bucket full of neatly stacked glowing files; a padlock on the lid; the robot hands an engineer a glowing ticket that fades like a candle; a small hourglass marks old files for removal.',
  'p3-7': 'a tiny vending-machine box that wakes up every time a small clock hand moves; the robot inside sweeps away leftover machine blocks with a broom; a snake-shaped soft toy sits on top.',

  # p4 Infrastructure as code
  'p4-1': 'the robot writes a glowing blueprint and a small machine reads it and builds matching blocks; a transparent jar with a bookmark ribbon holds the current state as small cubes.',
  'p4-2': 'a tidy filing cabinet with nested drawers; the robot pulls a drawer that links to another by a glowing thread; a row of small identical units each with its own tiny blueprint.',
  'p4-3': 'the robot edits a blueprint on a drafting table while three miniature models stand beside it: a walled cloud island, a pool of resting machines and a small proxy gatehouse.',
  'p4-4': 'a night bakery: the robot takes a freshly baked machine-image loaf out of an oven, checks it with a small gauge, and either places it on the shelf or puts an older loaf back.',
  'p4-5': 'a glass box with a robot inside; a single narrow pipe leaves the box through a gatehouse with a short list of three glowing doorway shapes; everything else outside is dark.',
  'p4-6': 'a conveyor of blueprints passing through four glass gates with green lights; a sealed read-only window shows a preview; a big apply lever is locked behind a cage that only an engineer can open.',

  # p5 Kubernetes
  'p5-1': 'stacked shipping containers grouped in glass pods, several pods inside a larger soft bubble; a tiny ship wheel on a post; the robot points at one container with a long pointer.',
  'p5-2': 'the robot places a wrapped parcel on a small dock from a blueprint; a round database cylinder of glowing discs stands beside it; the parcel carries a round fingerprint-like seal.',
  'p5-3': 'a vault with a small glowing window; a thin cable runs from the vault to one glass pod where a robot reads a card; a second pod has no cable and stays dark.',
  'p5-4': 'glass pods joined by a few glowing cables while most cable sockets are capped; one pod has a narrow tunnel to a small walled cloud island; an engineer caps a loose socket.',

  # p6 Telemetry
  'p6-1': 'a lighthouse with three coloured beams: a bar chart, a scroll of lines and a string of beads; the beams pass through a small washing station that blurs private papers before they leave.',
  'p6-2': 'the robot attaches small tick counters and a row of glass tubes with rising levels to a server tower; a tiny door on the tower lets an engineer peek at the gauges.',
  'p6-3': 'a wall of glowing dashboard panels built from stacked blocks; a small bell beside one panel rings and sends a glowing paper plane to a chat bubble kiosk.',
  'p6-4': 'a night-time counting room: the robot moves beads on three abacus frames while a calendar wheel turns; an engineer looks through three different lenses at the same chart.',

  # p7 Temporal
  'p7-1': 'a long winding path with a storm cloud over the middle; the robot keeps walking with a glowing thread tied to a post, so when it slips it climbs back to where it was.',
  'p7-2': 'the robot follows a glowing dotted path exactly, step by step, while helper robots do the work at side stations; a small heartbeat pulse lamp glows on each station.',
  'p7-3': 'an hourglass with the robot asleep inside; an engineer presses a big round button and the robot wakes up; a small bell and a timer dial on a post.',
  'p7-4': 'the robot picks a round coloured tag from a board of tags and hangs it on a new run; two runs with the same tag shape bump into each other and only one starts; a few queue lanes with small flags.',
  'p7-5': 'a calendar wheel with small pegs; the robot peeks through a window at a ticket board every few minutes with a spyglass instead of waiting for a knock; an overlap bar stops two runs starting together.',
  'p7-6': 'the robot patches a moving conveyor with a small glowing plate without stopping it; a long scroll of history is cut and a fresh short scroll begins.',
  'p7-7': 'a test bench with a small clock whose hands spin fast; the robot replays a scroll of steps on a tiny player; helper stations are cardboard stand-ins.',

  # p8 Claude Agent SDK
  'p8-1': 'an engineer presses a button and the robot wakes up with a glowing visor; a stream of soft glowing cards flows from the robot to a tray; a small sealed binary block is pinned on the desk.',
  'p8-2': 'a belt of tiny tools on the robot; some tools glow green and some are capped with grey covers; an engineer holds a small dial with three positions.',
  'p8-3': 'an engineer hands the robot a small custom tool on a cable; the robot plugs it into its belt and a tiny lamp on the tool lights up.',
  'p8-4': 'low glowing walls around a work desk; the robot bumps gently into one wall when it reaches toward a protected folder; a small post with a shield shape and a green check lamp.',
  'p8-5': 'a second smaller robot sits in a separate glass booth with its own tiny tools and reads a document with a magnifying glass; it hands a neat card through a slot to the first robot.',
  'p8-6': 'the robot packs its glowing memory crystal into a round bucket, walks across a bridge to a second glass box and unpacks the crystal there.',
  'p8-7': 'a conductor engineer with a baton; three robots work side by side, then pass blocks down a line; a small set of sized boxes shows which jobs get many robots.',
  'p8-8': 'three robot heads of different sizes on a shelf; a dial for effort; a gatehouse that every request passes through; a warm glowing jar keeps a shared block of context warm.',

  # p9 Talking to people's tools
  'p9-1': 'a chat bubble kiosk with a slash-shaped lever, two round buttons and a hanging thread of smaller bubbles; the robot answers inside the thread while an engineer presses a button.',
  'p9-2': 'a ticket board of coloured cards; the robot looks through a spyglass at the board and reads a small history scroll pinned to a card; a slow clock on the wall.',
  'p9-3': 'the robot wraps a small box with a faint draft outline, attaches a tag card, waits for a glass gate of green lights, then removes the outline so the box is ready.',

  # p10 Python
  'p10-1': 'a short bridge between a blue desk and a yellow desk; the robot carries the snake-shaped soft toy across; a small board of matching puzzle pieces shows the same shapes in both colours.',
  'p10-2': 'the robot runs a row of tiny test cars in parallel lanes on a small track; a few lanes are closed; the snake-shaped soft toy watches from a stand.',
  'p10-3': 'a small building with three floors: a basement of database cylinders, a middle floor of sorting trays and a top floor of counters; a practice copy of the building stands beside it in glass.',
  'p10-4': 'two identical boxes side by side, one real and one a soft cardboard model; the robot runs the same row of tests on both and the green lights match.',
  'p10-5': 'a conveyor where database blueprints, pipes and a tiny client kit pass through four glass gates; one gate flags a changed pipe shape with an amber light.',
  'p10-6': 'a doctor robot with a small stethoscope checks an engineer desk; a single big verify button; a small bench of puzzle tasks on a tray.',

  # p11 Security walls
  'p11-1': 'a triangle of three glowing items on pedestals: a locked diary, an open letter and a lever; the robot stands in the middle and an engineer removes the lever from the triangle.',
  'p11-2': 'a broker tower hands the robot one small glowing ticket that only opens one door; a proxy gatehouse between the robot and a folder shelf refuses a push with a soft red lamp.',
  'p11-3': 'a glass gate on a conveyor that needs a second engineer to nod; a locked panel of checks; a broken test block tries to pass as a smaller block and is caught.',
  'p11-4': 'a round table where engineers and the robot move small model pieces through a drill; one piece is knocked over on purpose; a small runbook binder sits closed on the table.',

  # p12 Skills, plugins and evals
  'p12-1': 'the robot writes on a single glowing card with a neat header strip, then slides it into a small cartridge; a shelf of cartridges above the desk.',
  'p12-2': 'a row of small laptops on a desk; one cable from a control cabinet drops a cartridge into each; a short allow-list board of three glowing tool shapes.',
  'p12-3': 'a test bench where the robot runs through a row of small puzzle cases; a gauge needle shows the score; a golden tray of reference answers sits closed beside it.',
  'p12-4': 'the robot reads a simple scroll of four short glowing steps while an engineer writes it; a plain lamp replaces a cluttered pile of papers.',

  # g0 Guardrails and identity
  'g0-1': 'a front door with a new sturdy lock; the robot cannot push a block through until two engineers both nod; a small board of house rules pinned beside the door.',
  'g0-2': 'the robot receives a round ID badge at a badge station; a vault behind it with one narrow slot; a small glowing key rests in the vault, not on the robot.',
  'g0-3': 'a glass gate on a conveyor that stays red when the same engineer who pushed the block also stamps it; a second engineer arrives and the gate turns green.',
  'g0-4': 'a locked panel of check gates; the robot reaches for the panel and a small shield lamp blocks it; a test block that was trimmed smaller is caught on a scale.',
  'g0-5': 'a gatehouse between the robot and a large glowing model brain; the gatehouse adds a small key to each passing envelope and ticks a coin counter.',
  'g0-6': 'a shelf of small robot figures each with a coloured dot badge; a control cabinet drops a cartridge into each laptop; a coin jar with a marked ceiling line.',
  'g0-7': 'four tools on a counter are carried in a box across a bridge into a bigger workshop; two engineers hold each tool together; a small spare key hangs on a hook.',

  # g1 Telemetry and metrics
  'g1-1': 'a lighthouse collector with a washing station that blurs papers before the beam leaves; many small laptops send threads of light to it.',
  'g1-2': 'a night counting room: the robot pulls beads from a ticket board, a pull-request tree and a conveyor into a big glowing jar; a calendar wheel turns backward to fill older jars.',
  'g1-3': 'four glowing dashboard panels on a wall: gauges, a test bench, a delivery lane and a coin jar; a small bell beside the coin jar sends a paper plane to a chat bubble.',
  'g1-4': 'a conveyor of runs where each step gets a small coloured tag; the robot sticks labels on failed blocks; a night-time abacus totals the numbers.',
  'g1-5': 'a shelf of eval result jars, three lenses on a stand, a small survey box with a slot and a row of sweeper robots checking a model brain with gauges.',

  # g2 Review gate (Byte)
  'g2-1': 'the robot digs small bug shapes out of a pile of old blocks with a trowel, keeps clean blocks on a tray, and gently plants a few bugs inside blocks on purpose.',
  'g2-2': 'a sealed glass booth where a robot reviews a block with a magnifying glass, no cables and no key inside; a scoreboard gauge beside the booth and a gate that only opens above a mark.',
  'g2-3': 'the robot fixes a block and hands it to an engineer for a nod before it moves on; a second review gate stays dark when all amber lights are gone.',
  'g2-4': 'a sorting station picks one of three robot heads per block and hangs a coloured risk tag on it; a live dashboard panel shows pulsing bars.',
  'g2-5': 'a block arrives with a small receipt card; the robot reads it with a magnifying glass; five robots with different lenses sit at a panel while one holds a skeptical pose with crossed arms.',

  # g3 Agent runtime
  'g3-1': 'a brand-new workshop with neat drawers; a conveyor with gates; a stack of container images; a small rulebook board pinned on the wall; the robot cuts a ribbon.',
  'g3-2': 'a tiny cloud island being fenced with a glass wall; small portholes lead to a bucket and a server box; a mirror shelf of packages stands inside the wall.',
  'g3-3': 'glass pods on a harbour dock hold an hourglass, a broker tower and a gateway; cables from a vault; a narrow tunnel runs to a walled cloud island.',
  'g3-4': 'a broker tower hands out small glowing tickets, each opening one door; a proxy gatehouse in front of a folder shelf; two small kiosks with a ticket board and a chat bubble behind it.',
  'g3-5': 'a night bakery oven produces machine-image loaves; a robot pokes each loaf with a gauge; a shelf with the good loaves and a bin for a bad one.',
  'g3-6': 'a gatehouse with a short list of three glowing door shapes beside three machine boxes of different sizes on a shelf.',
  'g3-7': 'machines resting under blankets in a warm pool; a bargain bin of cheaper machines; a sweeper robot with a broom clears leftover blocks every time a clock hand moves.',
  'g3-8': 'four stations in a row: the robot claims a glass box, works inside it, parks it under a blanket, then releases it with a wave.',
  'g3-9': 'inside the glass box: the robot at a desk surrounded by low glowing walls; a round bucket beside it receives a memory crystal.',
  'g3-10': 'a glowing ticket card enters a long winding lane with a few side lanes for helper robots; a small kill-switch lever under a glass cover; several timer dials on posts.',
  'g3-11': 'the robot saves small glowing cubes into a jar as it works; a glass box falls dark and a new one lights up with the cubes poured in; a storm cloud passes overhead.',
  'g3-12': 'a calendar wheel with pegs; the robot peeks at a ticket board through a spyglass; another robot sleeps in an hourglass with a small bell set to remind an engineer.',
  'g3-13': 'a chat bubble kiosk with a slash lever, a status card with coloured lamps, two round buttons and a hanging thread where the robot asks a question.',
  'g3-14': 'a watcher robot with binoculars spots another robot walking in a circle; a short ladder with a few rungs; a far backstop wall where the robot stops and waits.',
  'g3-15': 'a wrapped box with a small list of blocked doorway shapes pinned to it; a bell rings when a cable hits a closed porthole; a binder runbook on a stand.',
  'g3-16': 'a round table with a model of the runtime; engineers knock over each piece on purpose while the robot takes notes; a shield lamp glows.',

  # g4 Nova pilot
  'g4-1': 'an engineer drops a ticket card into a slot; the robot picks it up and lights a status card with coloured lamps; a small readiness gauge on the wall.',
  'g4-2': 'the robot holds a blueprint with a neat grid and asks questions with a raised hand; an engineer presses a big green button on a ticket board.',
  'g4-3': 'the robot writes a small checking guide card, picks three test blocks, locks them in a glass case, and a second small robot nods with a clipboard.',
  'g4-4': 'three fresh-eyed judges in separate glass booths: one with a measuring tape, one with a mirror and one with a tiny browser window; each hands a card through a slot.',
  'g4-5': 'inside a glass box the robot runs a small spike experiment, then a panel of robots reviews, then two robots attempt the same block side by side.',
  'g4-6': 'a wrapped box passes a template stand, a judge booth, a review gate with a magnifying glass and a final ready gate with green lights; the draft outline fades.',
  'g4-7': 'a bench of forty small puzzle tasks mined from a pile of old tickets; the robot scores each with a gauge; a gate only opens above a mark.',
  'g4-8': 'the robot works on its own workshop first, then crosses a bridge to a bigger workshop; a weekly calendar wheel and a round table of engineers reviewing.',

  # g5 Routines
  'g5-1': 'a single drawing board shows a crescent moon crew: small robots with brooms and wrenches, a charter scroll with a wax seal, coloured dot badges and a reviewer chair with a glowing cushion.',
  'g5-2': 'a routine lane that starts from three bells: a red conveyor lamp, a ticket board and a calendar wheel; the robot steps onto the lane when any bell rings.',
  'g5-3': 'a quiet robot with a finger raised to its visor; a short ladder of trust rungs; a shadow silhouette of the robot beside an engineer doing the same task.',
  'g5-4': 'a storm cloud over a conveyor; one robot handles the red lamp while the others wait; a circuit breaker switch flips off a routine that keeps failing.',
  'g5-5': 'three fixer robots at a conveyor with a red lamp; one tries to shrink a test block and a scale catches it; a green lamp returns after an honest fix.',
  'g5-6': 'a calendar wheel turns a month; wrapped update packages arrive; a fixer robot repairs one package that broke a gate.',
  'g5-7': 'a bug shape under a bell jar; the robot first makes the bug appear on a small stage, then fixes it, then a test block proves it with a green lamp.',
  'g5-8': 'four sweeper robots: one carries dead branches to a bin, one patches a hole in a test wall, one merges two identical blocks, one shines a lamp into a dark corner.',
  'g5-9': 'a bench with a slice of puzzle tasks for each sweeper robot; gauges show honest scores; an engineer compares two trays.',

  # g6 R&D brain
  'g6-1': 'a round library floor plan drawn on a blueprint; a stack of blank page cards with a neat header strip; a conveyor gate that checks each card with a green light.',
  'g6-2': 'a shelf of thirty-five fresh page cards with soft glow; engineers each pick a card and turn a small confidence dial on it up.',
  'g6-3': 'a workshop entrance with one root card on a stand and small path-shaped cards hanging in each corridor; an arrow-shaped post points to a small helper kiosk.',
  'g6-4': 'the robot carries a chat thread into the library and files it as a card; a small nudge bell beside dusty cards; a pull-request tree gets a tidy note card.',
  'g6-5': 'a question box with a slot; a night-time gauge scores answer cards; a weekly cart wheels merged blocks into the library.',
  'g6-6': 'a chat bubble kiosk in front of the library; the robot answers with a card that carries small pins to library shelves; a shield lamp on the kiosk.',

  # g7 Fast feedback
  'g7-1': 'a new test lane beside a building of three floors; a stopwatch on a post; a tiny output tray with neat cards; a memory of which tests to rerun on a small pegboard.',
  'g7-2': 'three cardboard models beside their real counterparts: a small client box, a bucket and a task queue conveyor; the same test rows run on both.',
  'g7-3': 'the robot builds small data figures through a front counter instead of a back door; a cart carries old integration test blocks to the new lane.',
  'g7-4': 'four glass gates over a conveyor of blueprints and pipes; one amber lamp lights for a changed pipe; a tiny client kit passes a smoke test.',
  'g7-5': 'one big verify button on a desk and a doctor robot with a stethoscope checking a laptop; a green lamp.',
  'g7-6': 'a miniature full workshop built inside a glass dome on a conveyor; images are baked once and stored; the dome runs on every passing block.',
  'g7-7': 'a night counting room with a history scroll, a triage tray of failed blocks, a mutant block with a funny face and a row of padlocks being opened.',
  'g7-8': 'a conveyor of blueprints and charts through several gates; a read-only preview window; a small diff mirror shows two versions side by side.',

  # g8 Skills and tools
  'g8-1': 'a new market stall with shelves; robots carry cartridges from an old shed to the new stall; a catalogue board with cartridge shapes.',
  'g8-2': 'three glowing core cartridges on a pedestal: one with a blueprint and a raised hand, one with a green check, one with a storybook ribbon.',
  'g8-3': 'cartridges ride a conveyor through a validating gate; a shield hook attaches to each; a control cabinet drops them onto a row of laptops.',
  'g8-4': 'four cartridges on a bench, each with its own small test gauge; the robot runs them one after another.',
  'g8-5': 'a small classroom with benches of clay people; the robot and an engineer at a blank glowing board; a weekly calendar wheel and an open door.',
}
