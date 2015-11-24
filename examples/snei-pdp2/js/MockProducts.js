import MockProductType from "./MockProductType"

const MockProducts = {
	"Bundles": [
		{
			type: MockProductType.Bundle,
			title: "Star Wars Battlefront Deluxe Edition",
			imageUrl: "images/mock/bundle-01.jpg",
			size: 20615843020,
			price: 69.99,
			releaseDate: "2015-11-17T07:00:00.000Z",
			ratings: {
				stars: 5,
				count: 2
			},
			description:
	"Upgrade to the Star Wars™ Battlefront™ Deluxe Edition and get the base game plus five exciting in-game items\r\n\
	Feeling the ominous thud of an AT-AT stomping down on the frozen tundra of Hoth. Rebel forces firing blasters as Imperial speeder bikes zip through the lush forests of Endor. Intense dogfights between squadrons of X-wings and TIE fighters filling the skies. Immerse yourself in the epic Star Wars battles you've always dreamed of and create new heroic moments of your own in Star Wars Battlefront."
		},
		{
			type: MockProductType.Bundle,
			title: "Star Wars Battlefront Ultimate Edition",
			imageUrl: "images/mock/bundle-02.jpg",
			size: 20615843020,
			price: 119.99,
			releaseDate: "2015-11-17T07:00:00.000Z",
			ratings: {
				stars: 5,
				count: 171
			},
			description: "The STAR WARS™ Battlefront™ Ultimate Edition has everything fans need to live out their STAR WARS™ battle fantasies. In addition to the STAR WARS™ Battlefront™ Deluxe Edition, Rebels and Imperials alike will be able to expand their galaxy with the STAR WARS™ Battlefront™ Season Pass, which includes four upcoming expansion packs filled with new content, two-week early access* to each expansion and an exclusive Shoot First emote."
		},
	],

	"AddOns": [
		{
			type: MockProductType.AddOn,
			title: "Boba Fett Weapon Set",
			imageUrl: "images/mock/addon-01.jpg",
			size: 20615843020,
			price: 8.99,
			releaseDate: "2015-5-2T07:00:00.000Z",
			description: "Go behind the mask of the mysterious and deadly bounty hunter Boba Fett. Use the jet pack to bring death from above, or take out Rebel scum with the powerful rocket barrage or flamethrower. We will be revealing more in the months ahead, as well as introducing add-ons to several other things in the bla bla bla."
		},
		{
			type: MockProductType.AddOn,
			title: "Storm Trooper Pack",
			imageUrl: "images/mock/addon-02.jpg",
			size: 133169152,
			price: 12.99,
			releaseDate: "2015-11-17T07:00:00.000Z",
			description: "Side with the Empire and protect your Walkers while utilizing their mighty weaponry to crush the Rebel objective. In addition to Walker Assault, Star Wars Battlefront will feature immersive, fun-filled modes including Supremacy, Fighter Squadron, Blast, Drop Zone, Cargo and more to be announced in the months ahead. Stay tuned for more information on these exciting multiplayer modes."
		},

		{
			type: MockProductType.AddOn,
			title: "Add On A",
			imageUrl: "images/mock/addon-03.jpg",
			size: 1048576,
			price: 1.99,
			releaseDate: "2015-2-1T07:00:00.000Z",
			description: "Diceret vivendo imperdiet his ex, mei ad pericula argumentum, in meis scripta sit. Per te nominavi sapientem, sumo illud per et. Quo in velit suscipiantur consectetuer. Ne paulo graecis similique his, nec an detraxit percipitur, per et dicunt feugiat. Sed mutat idque convenire ex."
		},

		{
			type: MockProductType.AddOn,
			title: "Add On B",
			imageUrl: "images/mock/addon-04.jpg",
			size: 2097152,
			price: 2.99,
			releaseDate: "2015-2-2T07:00:00.000Z",
			description: "Lorem ipsum dolor sit amet, clita saperet pertinacia in vel, cetero perfecto interpretaris ut mei, usu te sumo docendi posidonium. Per tation eruditi vocibus at, cu justo ludus sed. Nec mucius salutandi efficiendi cu, congue adipiscing persequeris est in. Nam ex possit tibique maluisset, ius an illud maiestatis signiferumque. Dicit nominati vix no."
		},

		{
			type: MockProductType.AddOn,
			title: "Add On C",
			imageUrl: "images/mock/addon-05.jpg",
			size: 3145728,
			price: 3.99,
			releaseDate: "2015-2-3T07:00:00.000Z",
			description: "Lorem ipsum dolor sit amet, sed altera repudiare honestatis et, in aeque paulo interpretaris quo. His iudico ignota interesset et. Ea labitur necessitatibus eos. Sit utinam officiis democritum ut, in sed latine invidunt adversarium. Nisl sumo legimus mel et. Affert mollis posidonium cu eum, ei eos decore luptatum consequat, odio etiam cum an."
		},

		{
			type: MockProductType.AddOn,
			title: "Add On D",
			imageUrl: "images/mock/addon-06.jpg",
			size: 4194304,
			price: 4.99,
			releaseDate: "2015-2-4T07:00:00.000Z",
			description: "Lorem ipsum dolor sit amet, ne ius aperiri malorum ponderum, pri ex placerat abhorreant. Et sea odio probo, sit prima animal ei. Eum ad dicat complectitur, ex mei democritum constituto, debet veritus salutatus ex est. Discere ocurreret inciderint ius et, ei vim copiosae contentiones consectetuer. Per percipit referrentur ea, cu essent recusabo his."
		}
	],

	"RelatedGames": [
		{
			type: MockProductType.Game,
			title: "The Witcher 3: Wild Hunt",
			imageUrl: "images/mock/related-01.jpg",
			size: 0,
			price: 59.99,
			releaseDate: "2015-5-3T07:00:00.000Z",
			ratings: {
				stars: 4,
				count: 136
			},
			description: "In The Witcher, you are a professional monster hunter, tasked with finding a child of prophecy in a vast open world rich with merchant cities, dangerous mountain passes, and forgotten caverns to explore. Trained from early childhood and mutated to gain superhuman skills, strength and reflexes, witchers are a distrusted counterbalance to the monster-infested world in which they live."
		},

		{
			type: MockProductType.Game,
			title: "Mirror's Edge Catalyts",
			imageUrl: "images/mock/related-02.jpg",
			size: 0,
			price: 69.99,
			releaseDate: "2015-6-3T07:00:00.000Z",
			ratings: {
				stars: 4,
				count: 209
			},
			description: "Follow Faith, a daring free runner, as she fights for freedom in the city of Glass. What appears to be an elegant, high-tech city on the outside, has a terrible secret hidden within. Explore every corner from the highest beautifully lit rooftops to the dark and gritty tunnels below."
		},

		{
			type: MockProductType.Game,
			title: "Related Game A",
			imageUrl: "images/mock/related-03.jpg",
			size: 0,
			price: 1.99,
			releaseDate: "2015-2-1T07:00:00.000Z",
			ratings: {
				stars: 1,
				count: 10
			},
			description: "Diceret vivendo imperdiet his ex, mei ad pericula argumentum, in meis scripta sit. Per te nominavi sapientem, sumo illud per et. Quo in velit suscipiantur consectetuer. Ne paulo graecis similique his, nec an detraxit percipitur, per et dicunt feugiat. Sed mutat idque convenire ex."
		},

		{
			type: MockProductType.Game,
			title: "Related Game B",
			imageUrl: "images/mock/related-04.jpg",
			size: 0,
			price: 2.99,
			releaseDate: "2015-2-2T07:00:00.000Z",
			ratings: {
				stars: 2,
				count: 20
			},
			description: "Lorem ipsum dolor sit amet, clita saperet pertinacia in vel, cetero perfecto interpretaris ut mei, usu te sumo docendi posidonium. Per tation eruditi vocibus at, cu justo ludus sed. Nec mucius salutandi efficiendi cu, congue adipiscing persequeris est in. Nam ex possit tibique maluisset, ius an illud maiestatis signiferumque. Dicit nominati vix no."
		},

		{
			type: MockProductType.Game,
			title: "Related Game C",
			imageUrl: "images/mock/related-05.jpg",
			size: 0,
			price: 3.99,
			releaseDate: "2015-2-3T07:00:00.000Z",
			ratings: {
				stars: 3,
				count: 30
			},
			description: "Lorem ipsum dolor sit amet, sed altera repudiare honestatis et, in aeque paulo interpretaris quo. His iudico ignota interesset et. Ea labitur necessitatibus eos. Sit utinam officiis democritum ut, in sed latine invidunt adversarium. Nisl sumo legimus mel et. Affert mollis posidonium cu eum, ei eos decore luptatum consequat, odio etiam cum an."
		},

		{
			type: MockProductType.Game,
			title: "Related Game D",
			imageUrl: "images/mock/related-06.jpg",
			size: 0,
			price: 4.99,
			releaseDate: "2015-2-4T07:00:00.000Z",
			ratings: {
				stars: 4,
				count: 40
			},
			description: "Lorem ipsum dolor sit amet, ne ius aperiri malorum ponderum, pri ex placerat abhorreant. Et sea odio probo, sit prima animal ei. Eum ad dicat complectitur, ex mei democritum constituto, debet veritus salutatus ex est. Discere ocurreret inciderint ius et, ei vim copiosae contentiones consectetuer. Per percipit referrentur ea, cu essent recusabo his."
		},
	]
};

export default MockProducts;