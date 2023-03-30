const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const knex = require("../knex");

async function signup(req, res) {
  try {
    const { email, password, name, phoneNumber } = req.body;
    const [userEmail] = await knex("users").select("email").where({ email });
    const [userPhone] = await knex("users")
      .select("mobile_no")
      .where({ mobile_no: phoneNumber });

    if (userEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }
    if (userPhone) {
      return res.status(409).json({ message: "Phone number already in use." });
    }
    const newUser = {
      email: email,
      mobile_no: phoneNumber,
      name: name,
      password: await hashPassword(password),
    };
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await knex("users").insert(newUser).returning("*");
    return res.status(200).json({message: " You have succesfully registered", token: token });
  } catch (error) {
    console.log({ error });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const [user] = await knex("users").select("*").where({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({ message: "you have succesfully logged in", token: token });
  } catch (error) {
    console.log({ error });
  }
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader;
    let decodedEmail = "";
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    decodedEmail = decoded.email;
    const [user] = await knex("users")
      .select("*")
      .where({ email: decodedEmail });
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const rowsUpdated = await knex("users")
      .where({ email: decodedEmail })
      .update({ password: hashedPassword });
    if (rowsUpdated) {
      return res.status(200).json({ message: "Password changed successfully" });
    } else {
      return res.status(400).json({ message: "Failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

module.exports = {
  signup,
  login,
  changePassword,
};
