const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const uid = require("uid").uid;
const OTP = require("otp-generator");
const database = require("../database").promise(); // Kenapa di .promise()
const utils = require("../utils");
const schema = require("../utils/schema");
// const otp_generator =
const transporter = require("../utils/transporter");

const register = async (req, res) => {
  const { username, email, password, fullname, date_of_birth, gender } =
    req.body;
  try {
    // 1 Validasi data
    // -Username unik, min6 karakter, include number
    // - correct email -> @gmail.com, @yahoo.co.id, @outlook.com, etc.

    // validasi data
    const { error } = schema.validate(req.body);
    if (error) throw { message: error.details[0].message }; // Hanya ambil sebagian dari error yang ditampilkan yaitu messagenya saja

    // - username & email unik
    const CHECK_USER = `SELECT username FROM user WHERE username = ? AND email = ?`;
    const [USERS] = await database.query(CHECK_USER, [username, email]);

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

    // 4.0. Generate OTP
    const OTP = otpGenerator.generate(6, {
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: true,
    });
    console.log(OTP);

    // 4.1 save OTP ke database
    const SAVE_OTP = `INSERT into otp_history (OTP) VALUES (?)`;
    const [OTP_INFO] = await database.query(SAVE_OTP, [OTP]);

    // Set expired time of OTP using event scheduler, token_${OTP} NANTI NAMA EVENT NYA AKAN BERBEDA WALAUPUN ADA SEKALIGUS 10 USER YANG BERBARENGAN BIKIN OTP"
    const SET_SCHEDULE = `CREATE EVENT IF NOT EXISTS token_${OTP}
    ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 30 SECOND
    DO DELETE FROM otp_history WHERE id = ? 
    `;
    await database.query(SET_SCHEDULE, [OTP_INFO.insertId]);

    // 4.2 KIRIM VERIFIKASI INFO (DATA YG DIKIRIM BISA BERUPA LINK, OTP, UNIQUE PASSWORD) KE USER, METODE BISA PAKAI EMAIL, SMS, WA, CALL
    const message = `
    <h1>OTP Verification</h1>
    <p>Please insert this token</p>
    <p>token : ${OTP}</p>
    <p>Available for 30 seconds</p>
    `;
    const info = await transporter.sendMail({
      from: `"Admin Warehouse" <jcwdvl02.warehouse@gmail.com>`,
      to: "bagoes.tyo@gmail.com",
      subject: "Email Verification",
      html: message,
    });
    console.log("Message sent: %s", info.messageId);

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
    const TOKEN = JWT.sign(
      // pada penggunaan ini uid dan username yang dijadikan TOKEN, SECRET KEY adalah yang meng encrypt
      { uid: USER[0].uid, username: USER[0].username },
      process.env.SECRET_KEY
    );

    res.header(`Authorization`, `Bearer ${TOKEN}`); // Ini bisa dilihat di https://stackoverflow.com/questions/23751914/how-can-i-set-response-header-on-express-js-assets, nanti di header insomnia akan muncul tokennya bukan di body
    res.status(200).send(
      new utils.CreateRespond(200, "Login Success", {
        id: USER[0].id,
        uid: USER[0].uid,
        username: USER[0].username,
        email: USER[0].email,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const keeplogin = async (req, res) => {
  try {
    // 1. Cek token yang ada di header
    const TOKEN = req.header("x-access-token");
    if (!TOKEN) throw { message: "access denied." };

    // 2. Verifikasi token, JWT.verify ini akan membuat TOKEN yang udah jadi dibalikkin lagi ke bentuk object yang berisi data yang digunakan untuk buat TOKEN
    const { uid } = JWT.verify(TOKEN, process.env.SECRET_KEY);
    if (!uid) throw { message: "invalid access token." };

    // 3. get user data
    const GET_USER = "SELECT id, uid, username, email FROM user WHERE uid = ?";
    const [USER] = await database.query(GET_USER, [uid]);

    // 4. send data to client side
    res.status(200).send(new utils.CreateRespond(200, "verified", USER[0]));
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const verifyOTP = async (req, res) => {
  const { otp_token } = req.body;
  try {
    const CHECK_OTP = `SELECT OTP from otp_history WHERE OTP = ?`;
    const [OTP] = await database.query(CHECK_OTP, [otp_token]);
    console.log(OTP);

    if (!OTP.length) throw { message: `OTP token is already expired.` };

    // 1. Remove event scheduler
    const REMOVE_EVENT = `DROP EVENT IF EXISTS token_${otp_token}`;
    await database.query(REMOVE_EVENT);

    // 2. set status user
    const CHANGE_STATUS = `UPDATE user SET verified_status = 1`;
    const [INFO] = await database.query(CHANGE_STATUS);

    // 3. Remove Token
    const REMOVE_TOKEN = `DELETE FROM otp_history WHERE OTP = ?`;
    await database.query(REMOVE_TOKEN, [otp_token]);

    res
      .status(200)
      .send(new utils.CreateRespond(200, "OTP Verification Success", INFO));
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

module.exports = { register, login, keeplogin, verifyOTP };
