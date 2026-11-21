// Help text for each input (HELP) and each section (GUIDES).
var HELP = {
  cond:"Pick the conductor named on the drawing or the structure label. This fills in the mass and breaking load. If yours is not listed, choose Custom and type the mass.",
  mass:"Weight of one conductor per metre or per foot. Old drawings give it in the notes under the schedule, for example w = 0.49 lbs/ft. If the drawing states it, use the drawing's figure.",
  uts:"The conductor's breaking load, also called UTS. It is needed for the % UTS method, and it shows how hard the conductor is working.",
  n:"How many conductors this one set of rigging holds. One subconductor at a time is 1. Both subconductors of a duplex phase on one yoke is 2.",
  tKnown:"The tension written on the route plan and profile. Old sheets list it in the notes under the schedule, in lb. Newer sheets give it in kN. Use the no-wind or everyday figure.",
  tSpan:"Horizontal length of the span you are working out the tension for. Take it from the drawing or a rangefinder.",
  tSag:"The drop from the straight line between the two attachment points down to the conductor at mid-span.",
  wTime:"Strike the conductor near the structure and start the stopwatch on the strike. Stop it when the last return you count arrives back.",
  wN:"How many times the wave came back to you. Three or more gives a better figure than one.",
  tH:"How much higher this structure's attachment point is than the one at the other end of the span. Use the conductor RLs or attachment heights on the drawing. The uphill end of a span carries more tension, and this also sets the angle the conductor leaves the structure at.",
  tPct:"Everyday tension as a share of the breaking load. Newer drawings list it by section in the notes table. Around 20% is typical.",
  ws:"The length of conductor this structure carries, measured from the low point of one span to the low point of the next. Old schedules have a Weight Span column. Newer sheets print it on the structure label.",
  l1:"Length of the span behind this structure.",
  l2:"Length of the span ahead of this structure.",
  h1:"How much higher this structure's attachment point is than the one behind. Enter a minus figure if this structure is lower.",
  h2:"How much higher this structure's attachment point is than the one ahead. Enter a minus figure if this structure is lower.",
  hw:"Weight of the insulator string and fittings that hang on the rigging along with the conductor.",
  wt:"Hold-down weights fitted at this structure. Drawings show them in the Weights column or on the structure label.",
  dev:"The angle the line turns through at this structure. Old sheets show the change of bearing and newer sheets show a PI angle. The tension in both spans pulls the conductor toward the inside of the angle, and the rigging has to hold that as well as the weight.",
  dyn:"A multiplier for jerks and movement while lifting or pulling. 1.0 means a dead-steady load. Use the figure in your procedure.",
  parts:"The number of rope lines running between the blocks that share the load. More parts means less pull on the lead line.",
  sheaves:"Count every sheave the rope passes over between the load and the capstan. Each one adds friction.",
  fric:"Extra pull lost at each sheave. Roller-bearing blocks lose less than plain bushed blocks. Use the figure for your blocks.",
  redir:"The angle between the rope going into the redirect block and the rope coming out. At 0° the rope doubles back and the block carries twice the rope pull. At 90° it carries 1.41 times. At 120° it carries the same as the rope.",
  legs:"One leg carries the whole load. Two legs share it, but each leg carries more as the legs spread apart.",
  slingAngle:"The angle between the two sling legs at the hook. At 60° each leg carries 58% of the load. At 120° each leg carries the full load."
};
var GUIDES = {
  top:"<p><b>Basic</b> is for the field. It asks only for what a crew can see or measure on site.</p><p><b>Advanced</b> takes figures off a route plan and profile in the drawing's own units. It allows for angle structures, hardware, hold-down weights and height differences, and works out the load on each piece of rigging.</p><p><b>Vertical load</b> is the weight the rigging carries when you lift the conductor at a structure.</p><p><b>Tension load</b> is the pull along the conductor that the rigging holds when you take the tension at a structure.</p><p><b>Reset example</b> puts the example figures back.</p><p>Tap any <b>?</b> for help on that input, or <b>Guide</b> for help on a section. The dark bar at the top always shows the answer.</p>",
  secC:"<p>Tell the calculator which conductor it is and how many of them the rigging holds.</p><p>In Advanced, <b>Links, feet, lb</b> switches every input to old-drawing units and <b>Metric</b> switches them back. Figures already entered are converted. Each input also has its own unit picker beside it.</p>",
  secT:"<p><b>Drawing</b> (Advanced): type the tension straight off the route plan and profile.</p><p><b>Sag</b>: enter the span length and the sag measured at mid-span.</p><p><b>Return wave</b>: strike the conductor, time the wave going out and back, and count the returns. No sag measurement needed.</p><p><b>% UTS</b>: a share of the conductor's breaking load.</p><p>All four give the horizontal tension. <b>At this structure</b> adds the extra pull from the conductor's own weight hanging below the attachment point. The angle the conductor leaves at, and the horizontal and vertical parts of the pull, show which way the rigging is loaded.</p>",
  secV:"<p><b>Enter weight span</b>: type the weight span off the drawing.</p><p><b>Work it out</b> (Advanced): enter the spans and height differences either side and the calculator finds the weight span. It needs a tension to do this.</p><p>The picture shows the weight span in colour: the length of conductor between the two low points, which is what hangs on this structure.</p><p>At an angle structure the tension also pulls sideways. The lift load is the weight and the sideways pull combined.</p>",
  secR:"<p><b>Hoist in line</b>: a lever hoist, chain hoist or strop straight between the anchor and the load. Every item carries the full load.</p><p><b>Rope and blocks</b>: a tackle with the lead line run through a redirect block to a capstan. The top anchor carries the load plus the lead line pull.</p><p>Each box below shows the load on one item and the smallest working load limit it needs. Type the item's WLL to check it: <b>OK</b> is under 85%, <b>CLOSE</b> is 85 to 100%, <b>OVER</b> is past its limit.</p>"
};

export { HELP, GUIDES };
