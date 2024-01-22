const { MongoClient } = require('mongodb');
const faker = require('faker');

const uri = 'mongodb://localhost:27017';
const databaseName = 'console_rental';

const client = new MongoClient(uri);

async function fillDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db(databaseName);

    //random user
    function generateRandomUser() {
      return {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'hashed_password',
        role: faker.random.arrayElement(['customer', 'customer', 'customer', 'admin']),
        details: {
          name: faker.name.findName(),
          address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
          },
          phone: faker.phone.phoneNumber(),
        },
        rentals: [],
      };
    }

    // random console
    function generateRandomConsole() {
      return {
        model: faker.random.word(),
        brand: faker.random.word(),
        availability: faker.datatype.boolean(),
        rental_fee: faker.datatype.float({ min: 5, max: 20, precision: 2 }),
        description: faker.lorem.paragraph(),
        reviews: [],
      };
    }

    // random rental
    function generateRandomRental(userId, consoleId) {
      return {
        user_id: userId,
        console_id: consoleId,
        rental_date: new Date(),
        return_date: faker.date.future(0.1),
        total_price: faker.datatype.float({min: 5, max: 1000, precision: 2}),
        returned: faker.datatype.boolean(),
      };
    }

    // random review
    function generateRandomReview(userId, consoleId) {
      return {
        user_id: userId,
        console_id: consoleId,
        rating: faker.datatype.float({ min: 1, max: 5, precision: 1 }),
        comment: faker.lorem.sentence(),
      };
    }


    userNumber = 1000
    consoleNubmer = 20
    
    // insert random users

    const users = [];
    for (let i = 0; i < userNumber; i++) {
      users.push(generateRandomUser());
    }
    await database.collection('users').insertMany(users);

    // insert random consoles
    const consoles = [];
    
    for (let i = 0; i < consoleNubmer; i++) {
      const consoleData = generateRandomConsole();
      consoles.push(consoleData);
    }
    await database.collection('consoles').insertMany(consoles);

    // insert random rentals
    
    const usersIds = await database.collection('users').distinct('_id');
    const consolesIds = await database.collection('consoles').distinct('_id');
    
    for (let i = 0; i < userNumber; i++) {
        const rentals = [];
        rentalUserId = usersIds[i];
        for (let j = 0; j < faker.datatype.number({ min: 1, max: 5 }); j++) {
            rentals.push(generateRandomRental(rentalUserId, faker.random.arrayElement(consolesIds)));
        }
        await database.collection('users').updateOne(
            { _id: rentalUserId },
            { $set: { rentals: rentals } }
        );
    }
  
    // insert random reviews for the console

    for (let i = 0; i < consoleNubmer; i++) {
        const reviews = [];
        reviewConsoleId = consolesIds[i];

        for (let j = 0; j < faker.datatype.number({ min: 10, max: 30 }); j++) {
            reviews.push(generateRandomReview(faker.random.arrayElement(usersIds), reviewConsoleId));
        }
        await database.collection('consoles').updateOne(
            { _id: reviewConsoleId },
            { $set: { reviews: reviews } }
        );
    }

    console.log('Random data has been inserted into the MongoDB database.');
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fillDatabase();
