const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const assert = require('assert');

// Connection URL
const url = process.env.MONGO_URL

// Database Name
const dbName = process.env.MONGO_DATABASE;


const client = new MongoClient(url);


const repository = {
  save(poll) {
    return client.connect().then(() => {
      const db = client.db(dbName);
      const collection = db.collection('polls');
      return collection.insertOne(poll)//.then(() => client.close())
      .catch((err) => console.log(err));
    });
  },
  update(poll) {
    return client.connect().then(() => {
      const db = client.db(dbName);
      const collection = db.collection('polls');
      return collection.updateOne({id: poll.id}, { $set: poll })
      //.then(() => client.close())
      .catch((err) => console.log(err));
    });
  },
  delete(poll) {
    return client.connect().then(() => {
      const db = client.db(dbName);
      const collection = db.collection('polls');
      return collection.deleteOne({id: poll.id})
      //.then(() => client.close())
      .catch((err) => console.log(err));
    });
  },
  findById(id) {
    return client.connect().then(() => {
      const db = client.db(dbName);
      const collection = db.collection('polls');
    
      return collection.find({id: id}).toArray().then(polls => { 
        //client.close(); 
        return polls[0];
      })
      .catch((err) => console.log(err));
    });
  }
}

module.exports = repository;