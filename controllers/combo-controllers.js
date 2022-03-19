const utils = require('../utils');
const db = require('../database').promise();

const getComboBank = async (req, res) => {
    try {
        const GET_BANK = `SELECT * FROM bank`;
        const [ get_bank ] = await db.execute(GET_BANK);

        const data = get_bank;
        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getComboBank
}