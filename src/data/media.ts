/* Photography. Unsplash IDs (unsplash.com/license), hotlinked through
   images.unsplash.com. Every ID below was fetched on 14 Nov 2026 (HTTP 200)
   and looked at on a contact sheet for subject before being kept. People
   are stock models standing in for fictional Vuffora users; no real person
   is presented as a customer. Brand art (logo, app icons) is the client's
   own, served from /public/brand. */

export const photo = (id: string, w = 800, extra = '') =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop${extra}`

const UNSPLASH = {
  /* dogs: the demo cast */
  bruno: '1586671267731-da2cf3ceeb80', // yellow Labrador looking up, blue collar, dark backdrop: Bruno
  sheru: '1589941013453-ec89f33b5e95', // German Shepherd head tilt, teal backdrop: Sheru
  /* dogs: breeds seen across the app */
  goldenRose: '1552053831-71594a27632d', // golden retriever sitting with a flower in its mouth
  goldenFace: '1558788353-f76d92427f16', // golden retriever face, tongue out
  goldenFlower: '1510771463146-e89e6e86560e', // golden retriever holding a pink flower
  goldenPup: '1611003228941-98852ba62227', // golden retriever puppy lying down
  labPup: '1587764379873-97837921fd44', // yellow Labrador puppy on royal blue
  labChoc: '1585559700398-1385b3a8aeb6', // chocolate Labrador on sky blue
  beagle: '1543466835-00a7907e9de1', // smiling beagle
  husky: '1605568427561-40dd23c2acea', // husky smiling on grass
  huskyBlue: '1568572933382-74d440642117', // husky with blue eyes, close
  pugYellow: '1517849845537-4d257902454a', // black pug in a blanket on yellow
  frenchieHoodie: '1583337130417-3346a1be7dee', // French bulldog in a yellow hoodie on blue
  frenchieTee: '1583511655857-d19b40a7a54e', // French bulldog in a yellow tee on blue
  frenchieYellow: '1583512603805-3cc6b41f3edb', // French bulldog puppy lying on yellow
  corgi: '1597633425046-08f5110420b5', // corgi lying on white
  corgiOrange: '1537151608828-ea2b11777ee8', // corgi puppy on orange
  indie: '1561037404-61cd46aa615b', // black, tan and white mixed-breed looking at camera
  indieStreet: '1477884213360-7e9d7dcc1e48', // black and white dog smiling on a lane
  indiePups: '1444212477490-ca407925329e', // three tan street puppies
  indieBlack: '1534351450181-ea9f78427fe8', // black dog with big ears on white
  jackRussell: '1593134257782-e89567b7718a', // Jack Russell among flowers
  spitz: '1596492784531-6e6eb5ea9993', // white spitz on pink
  spitzSmile: '1529429617124-95b109e86bb8', // white spitz smiling outdoors
  cocker: '1560807707-8cc77767d783', // spaniel puppy resting its chin
  shihtzu: '1600804340584-c7db2eacf0bf', // small fluffy cream puppy on grass
  doodle: '1575859431774-2e57ed632664', // goldendoodle sitting on a bed
  aussie: '1601979031925-424e53b6caaa', // Australian shepherd puppy
  yorkie: '1546527868-ccb7ee7dfa6a', // Yorkshire terrier puppy on a woven rug
  /* dogs out and about */
  walkerPack: '1494947665470-20322015e3a8', // a pack of leashed dogs on a brick plaza
  runBeach: '1530281700549-e82e7bf110d6', // red retriever running out of the sea
  runGrass: '1534361960057-19889db9621e', // small white dog running on grass
  runBall: '1568393691622-c7ba131d63b4', // collie running with a ball in a garden
  runPup: '1576201836106-db1758fd1c97', // golden puppy running at sunset
  twoHarness: '1558929996-da64ba858215', // two dogs in harnesses looking up
  twoRun: '1548199973-03cce0bbc87b', // corgi and terrier running on a path
  twoField: '1560743641-3914f2c45636', // terrier and corgi in tall grass
  harnessGrass: '1554456854-55a089fd4cb2', // golden retriever in a harness lying on a lawn
  goldenRocks: '1612774412771-005ed8e861d2', // golden retriever standing on rocks
  goldenBeach: '1523480717984-24cba35ae1ef', // golden retriever sitting on a beach
  beachDog: '1587300003388-59208cc962cb', // brown and white dog on a beach
  toyDog: '1587559070757-f72a388edbba', // dog chewing a plush toy at home
  lickLab: '1518717758536-85ae29035b6d', // chocolate Labrador licking its nose
  /* people with dogs */
  hugDog: '1522276498395-f4f68f7f8454', // man hugging a retriever
  boyFrenchie: '1508675801627-066ac4346a61', // boy carrying a French bulldog
  pawShake: '1551730459-92db2a308d6a', // hand shaking a dog's paw, black and white
  coupleBed: '1601758003122-53c40e686a19', // couple at home with a spaniel
  coupleDog: '1601758124510-52d02ddb7cbd', // couple smiling with a black and white dog
  homeDog: '1601758177266-bc599de87707', // dog resting beside its owner on a sofa
  dogBed: '1581888227599-779811939961', // dog curled up in its bed
  /* places */
  parkPath: '1519331379826-f10be5486c6f', // tree-lined park path
  forestPath: '1441974231531-c6227db76b6e', // sunlit forest path
  /* people: owners */
  ananya: '1488426862026-3ee34a7d66df', // woman with dark hair in a denim jacket: Ananya (the owner)
  meera: '1567532939604-b6b5b0db2604', // woman with long dark hair, smiling: Meera
  priya: '1607746882042-944635dfe10e', // woman with dark hair, soft smile: Priya
  simran: '1623717217554-72ca676de535', // woman laughing, dark hair: Simran
  neha: '1494790108377-be9c29b29330', // woman in red, laughing: Neha
  tara: '1580489944761-15a19d654956', // woman with her hair up, smiling: Tara
  isha: '1548142813-c348350df52b', // woman laughing under palms: Isha
  rhea: '1573496359142-b8d87734a5a2', // woman in a grey blazer: Rhea
  vikram: '1629425733761-caae3b5f2e50', // bearded man in navy, arms crossed: Vikram
  kabir: '1566492031773-4f4e44671857', // man with glasses in a striped tee: Kabir
  dev: '1507003211169-0a1dd7228f2d', // man in a white tee, smiling: Dev
  aman: '1500648767791-00dcc994a43e', // man in a grey sweater: Aman
  /* people: walkers */
  arjun: '1595152772835-219674b2a8a6', // young man laughing in a black hat: Arjun (the walker)
  rohan: '1492562080023-ab3db95bfbce', // young man outdoors, arms crossed: Rohan
  gurpreet: '1544723795-3fb6469f5b39', // bearded man in a cap and yellow tee: Gurpreet
  sahil: '1564564321837-a57b7070ac4f', // man in a cap, blue sky: Sahil
  karan: '1610088441520-4352457e7095', // young man in a green hoodie: Karan
  imran: '1545167622-3a6ac756afa4', // older bearded man: Imran
  nikhil: '1633332755192-727a05c4013d', // man with glasses in a black tee: Nikhil
  yash: '1615813967515-e1838c1c5116', // young man in a red check shirt: Yash
  farhan: '1506794778202-cad84cf45f1d', // bearded man in a dark sweater: Farhan
  tenzin: '1542909168-82c3e7fdca5c', // young man in a dark tee: Tenzin
  pooja: '1534528741775-53994a69daeb', // woman in blue light: Pooja
  divya: '1611695434369-a8f5d76ceb7b', // person laughing, hair tucked: Divya
  /* people: the admin team */
  kavya: '1573497019940-1c28c88b4f3e', // woman with curly hair in a blazer: Kavya (Super Admin)
  rahul: '1599566150163-29194dcaad36', // man with glasses and a beard: Rahul (support)
} as const

export const MEDIA = UNSPLASH
export type MediaKey = keyof typeof MEDIA

export const img = (key: MediaKey, w = 800) => photo(MEDIA[key], w)
export const face = (key: MediaKey, w = 160) => photo(MEDIA[key], w, `&h=${w}&crop=faces`)

/* The client's own brand art */
export const BRAND = {
  mark: '/brand/mark.png', // dog on the yellow blob, transparent background
  logoWhite: '/brand/logo-white.jpg', // horizontal lockup with the brand line, on white
  iconYellow: '/brand/icon-yellow.jpg', // primary app icon
  iconDark: '/brand/icon-dark.jpg',
  iconPaw: '/brand/icon-paw.jpg',
  iconV: '/brand/icon-v.jpg',
} as const
