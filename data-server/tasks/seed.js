import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { accountData, postData, reviewData } from "../data/index.js";
import validSections from "../validation/validSections.js";


const db = await dbConnection();

await accountData.deleteFirebaseAccountsUnstable();
await db.dropDatabase();

console.log('seeding database');

let accountIDs = [];

try {

    console.log('creating accounts');

    const seedAccounts = [
        {username: "PurpCatMan", password: "testPass01A", email: "catatack@gmail.com", profilePic: "https://storage.googleapis.com/nerdipedia_images/purpcatirl.jpg"},
        {username: "ATLA Giant", password: "testPass02B", email: "momothegian@gmail.com", profilePic: "https://storage.googleapis.com/nerdipedia_images/shook_momo.png"},
        {username: "Deadman123", password: "testPass03C", email: "thelivingdead@gmail.com", profilePic: "https://storage.googleapis.com/nerdipedia_images/soul.jpg"}
    ];
    await Promise.all(seedAccounts.map(async (acc) => {
        let { firebaseUid, mongoUserId } = await accountData.createAccount(acc.username, acc.password, acc.email, acc.profilePic);
        accountIDs.push(mongoUserId);
    }));


    console.log('creating posts');

    const samplePostTitles = [
        "Who would win?",
        "You would not believe!",
        "Off Topic",
        "Weird Flex But Ok",
        "Shower thought I had last night",
        "I'm running out of ways to say this"
    ];
    const samplePostBodies = [
        "The FitnessGram Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly but gets faster each minute after you hear this signal bodeboop. A sing lap should be completed every time you hear this sound. ding Remember to run in a straight line and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark. Get ready!… Start. ding",
        "What the [beep] did you just [beep] say about me, you little [beep]? Ill have you know I graduated top of my class in the Navy Seals, and Ive been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and Im the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the [beep] out with precision the likes of which has never been seen before on this Earth, mark my [beep] words. You're [beep] dead, kiddo.",
        "Here's the thing. You said \"a Charizard is a dragon.\" Is it in the same family? Yes. No one's arguing that. As someone who is a Dragon type Gym Leader, I am telling you, specifically, in all of Kanto, no one calls Charizards dragons. If you want to be \"specific\" like you said, then you shouldn't either. They're not the same thing. If you're saying \"dragon egg group\" you're referring to the entirebreeding group, which includes things from Charmander to Magikarp to Goomy. So your reasoning for calling a Charizard a dragon is because random people \"call the giant lizards dragons?\" Let's get Mega Gyarados and Aerodactyl in there, then, too. Also, calling someone an Indigo E4 or Kanto E4, It's not one or the other, that's not how the Indigo League works. They're both. A Charizard is a Charizard and a member of the dragon family. But that's not what you said. You said a Charizard is a dragon, which is not true unless you're okay with calling all members of the dragon family dragons, which means you'd call Magikarp, Goomy, and Alolan Exeggutor dragons, too. Which you said you don't. It's okay to just admit you're talking about Mega Charizard X, you know?"
    ];
    const samplePostImages = [
        [],
        ["https://storage.googleapis.com/nerdipedia_images/cover1.jpg"],
        ["https://storage.googleapis.com/nerdipedia_images/cover2.jpg", "https://storage.googleapis.com/nerdipedia_images/cover1.jpg"]
    ]
    // generate 50 posts
    for (let i = 0; i < 50; i++){
        await postData.createPost(
            samplePostTitles[Math.floor(Math.random() * (samplePostTitles.length))],
            accountIDs[Math.floor(Math.random() * (accountIDs.length))],
            validSections[Math.floor(Math.random() * (validSections.length))],
            samplePostBodies[Math.floor(Math.random() * (samplePostBodies.length))],
            samplePostImages[Math.floor(Math.random() * (samplePostImages.length))]
        );
    }


    console.log('creating reviews');

    const seedReviews = [
        {
            body: "This right here is my favorite thing, ever. In the history of forever. I think about this every day. I think about this all night long. I stay awake not sleeping because I'm thinking about this.",
            rating: 10
        }, 
        {
            body: "It does not deserve this rating. It is very bad. The worst thing of all time Because it's a silly and boring thing.",
            rating: 1
        }, 
        {
            body: "perfectperfectperfectperfectperfectperfectperfectperfectperfectperfectperfectperfect",
            rating: 8
        }, 
        {
            body: "incredible glued to my screen the whole time, not a moment did i feel bored the whole time after fully completing this",
            rating: 7
        }, 
        {
            body: "This show has an incredible habit of being boring at the start of a season. This could be much better with like 6 episodes in the season because all you do is wait for the 2 last episodes just to get a little dopamine of something finally happening. Most of the characters are annoying.",
            rating: 3
        }
    ];
    const sampleShows = [
        "2790",
        "37196",
        "82",
        "38963",
        "38753",
        "396",
        "2059",
        "1615",
        "51394",
        "41428",
        "55138",
        "161",
        "169",
        "67"
    ];
    const sampleMovies = [
        "tt0133240",
        "tt3659388",
        "tt0382932",
        "tt1302011",
        "tt0098635",
        "tt0078748",
        "tt0113497",
        "tt0315327",
        "tt0468569",
        "tt0816692",
        "tt0117571",
        "tt0481499",
        "tt0126029"
    ];
    const sampleBooks = [
        "OL27448W",
        "OL82563W",
        "OL3140822W",
        "OL32327992W",
        "OL5735363W",
        "OL259010W",
        "OL17332803W",
        "OL17332806W",
        "OL16550682W"
    ];
    const reviewSections = [
        'show',
        'movie',
        'book'
    ];
    let r = 0;
    for (let acc of accountIDs){
        for (let show of sampleShows){
            r = Math.floor(Math.random() * (seedReviews.length));
            await reviewData.createReview(
                acc,
                seedReviews[r].body,
                seedReviews[r].rating,
                reviewSections[0],
                show
            );
        }
        for (let movie of sampleMovies){
            r = Math.floor(Math.random() * (seedReviews.length));
            await reviewData.createReview(
                acc,
                seedReviews[r].body,
                seedReviews[r].rating,
                reviewSections[1],
                movie
            );
        }
        for (let book of sampleBooks) {
            r = Math.floor(Math.random() * (seedReviews.length));
            await reviewData.createReview(
                acc,
                seedReviews[r].body,
                seedReviews[r].rating,
                reviewSections[2],
                book
            );
        }
    }

    console.log('done seeding database');
} catch (e) {
    console.trace(e);
}

await closeConnection();
process.exit(0);