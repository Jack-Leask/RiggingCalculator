// Conductor presets: [key, label, mass kg/m, breaking load kN].
// Source: Prysmian NZ bare overhead conductor catalogue. Confirm before relying on a figure.
var PRESETS = [
  ["custom","Custom or from the drawing",null,null],
  ["wolf","Wolf ACSR · 30/7/2.59 (37/.102)",0.730,69.2],
  ["goat","Goat ACSR · 30/7/3.71 (37/.146)",1.488,135.13],
  ["zebra","Zebra ACSR · 54/7/3.18 (61/.125)",1.621,131.9],
  ["chukar","Chukar ACSR · 84/7/3.70",3.137,227.6],
  ["coyote","Coyote ACSR · 26/7",0.509,46.9],
  ["dog","Dog ACSR · 6/7",0.394,32.7],
  ["mink","Mink ACSR · 6/1/3.66",0.2549,21.67],
  ["ferret","Ferret ACSR · 6/1/3.00",0.170,15.2],
  ["sulphur","Sulphur AAAC · 61/3.75",1.860,145],
  ["selenium","Selenium AAAC · 61/3.25",1.400,114],
  ["oxygen","Oxygen AAAC · 19/4.75",0.924,73.6],
  ["nobelium","Nobelium AAAC · 37/3.25",0.845,72.8],
  ["nitrogen","Nitrogen AAAC · 37/3.00",0.721,62.2],
  ["neon","Neon AAAC · 19/3.75",0.576,47.8],
  ["krypton","Krypton AAAC · 19/3.25",0.433,37.4],
  ["iodine","Iodine AAAC · 7/4.75",0.339,27.1],
  ["helium","Helium AAAC · 7/3.75",0.212,17.6]
];

export { PRESETS };
