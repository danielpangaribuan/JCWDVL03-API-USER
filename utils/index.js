// error handing
class CreateError {
  constructor(
    _title = "Internal Service Error",
    _code = 500,
    _type = "",
    _message = "Something bad has been occured",
    _detail = ""
  ) {
    (this.title = _title),
      (this.code = _code),
      (this.type = _type),
      (this.message = _message),
      (this.detail = _detail);
  }
}

// respond handling
class CreateRespond {
  constructor(_status, _type, _data) {
    (this.status = _status), (this.type = _type), (this.data = _data);
  }
}

// custom middleware -> terminal log
const UrlLogger = (req, res, next) => {
  console.log(`${req.method} : ${req.url}`);
  next();
};

module.exports = { CreateError, CreateRespond, UrlLogger };
