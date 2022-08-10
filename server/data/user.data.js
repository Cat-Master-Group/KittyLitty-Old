const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const mongoCollections = require("../config/mongoCollections");
const e = require("express");
const { users } = mongoCollections;
const saltRounds = 16;

const createUser = async (userName, email, unHashedPassword) => {
  if (!userName || !email || !unHashedPassword) {
    throw "signIn incomplete";
  }

  const userCollection = await users();

  const password = await bcrypt.hash(unHashedPassword, saltRounds);

  const payLoad = {
    userName,
    password,
    email,
  };
  const oneUser = await userCollection.insertOne(payLoad);
  if (oneUser.insertedCount === 0) {
    throw "Insert failed!";
  }
  return await getUser(oneUser.insertedId.toString());
};

const getUser = async (id) => {
  const userCollection = await users();
  const oneUser = await userCollection.findOne({ _id: ObjectId(id) });
  if (!oneUser) {
    throw "User not found";
  }
  return oneUser;
};

const getAllUser = async () => {
  const userCollection = await users();
  const allUsers = await userCollection.findAll();
  return allUsers;
};

const authUser = async (email, password) => {
  if (!email || !password) {
    throw "incomplete login";
  }
  const userCollection = await users();
  const oneUser = await userCollection.findOne({ email });
  if (!oneUser) {
    return false;
  }

  const correctPassword = await bcrypt.compare(password, oneUser.password);

  if (correctPassword) {
    return oneUser;
  } else {
    return false;
  }
};

const changeUser = async (user, changeObj) => {
  const payload = {};
  if (changeObj.catGender) {
    payload.catGender = changeObj.catGender;
  }
  if (changeObj.catAge) {
    payload.catAge = changeObj.catAge;
  }
  if (changeObj.catBreed) {
    payload.catBreed = changeObj.catBreed;
  }
  if (changeObj.catIsAltered) {
    payload.catIsAltered = changeObj.catIsAltered;
  }
  if (changeObj.userBio) {
    payload.userBio = changeObj.userBio;
  }

  const userCollection = await users();
  const changedUser = await userCollection.updateOne(
    {
      _id: ObjectId(user.id),
    },
    { $set: payload }
  );
  if (!changedUser.matchedCount && !changedUser.modifiedCount) {
    throw "Update failed";
  }
  return await getUser(id);
};

module.exports = { createUser, authUser, changeUser };
