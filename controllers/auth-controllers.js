const bcrypt = require("bcrypt");
const uid = require("uid").uid;
const database = require("../database").promise(); // Kenapa di .promise()
const utils = require("../utils");
const schema = require("../utils/schema");

const register = async (req, res) => {
  const { username, email, password, fullname, date_of_birth, gender } =
    req.body;
  try {
    // 1 Validasi data
    // -Username unik, min6 karakter, include number
    // - correct email -> @gmail.com, @yahoo.co.id, @outlook.com, etc.

    // validasi data
    const { error } = schema.validate(req.body);
    if (error) throw error.details[0].message; // Hanya ambil sebagian dari error yang ditampilkan yaitu messagenya saja

    // - username unik
    const CHECK_USER = `SELECT username FROM user WHERE username = ?`;
    const [USERS] = await database.query(CHECK_USER, [username]);

    if (USERS.length)
      throw { message: `Username ${username} is already exist` }; // Check username nya sudah ada atau belum

    // 2. Hash password, lihat di npm bcrypt di internet ada
    const SALT = bcrypt.genSaltSync(10);
    const HASH = bcrypt.hashSync(password, SALT);
    console.log(HASH);

    // 3. Simpan data user ke Database
    const UID = uid(7);
    const INSERT_USER = `INSERT INTO user (uid,username,email,password,fullname,date_of_birth,gender) VALUES (?,?,?,?,?,?,?)`;
    const [INFO] = await database.query(INSERT_USER, [
      UID,
      username,
      email,
      HASH,
      fullname,
      date_of_birth,
      gender,
    ]);

    res
      .status(200)
      .send(new utils.CreateRespond(200, "Register Success", INFO));
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Authentication = compare data from req.body to data user in our database
    // - Check username is exist in database or not
    const CHECK_USER = `SELECT * FROM user Where username=?`;
    const [USER] = await database.query(CHECK_USER, [username]);
    if (!USER.length)
      throw { message: `User with username : ${username} is not registered` };

    // - Check password
    console.log(USER);
    const VALID = bcrypt.compareSync(password, USER[0].password);
    if (!VALID) throw { message: `Password incorrect!` };

    // 2. GIVE AUTHORIZATION USING TOKEN

    res.status(200).send(new utils.CreateRespond(200, "Login Success", []));
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

module.exports = { register, login };
