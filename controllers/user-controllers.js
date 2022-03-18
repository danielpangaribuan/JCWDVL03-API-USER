const utils = require('../utils');
const db = require('../database').promise();

const addAddress = async (req, res) => {
    const { user_id, fullname, mobile_number, landmark, full_address, province, province_id, city, city_id, postal_code } = req.body;
    try {
        const ADD_ADDRESS = `INSERT INTO user_address 
                                (user_id, fullname, phone_number, full_address,
                                    landmark, province, province_id, city,
                                    city_id, postal_code, created_at, updated_at) 
                            VALUES ('${user_id}', '${fullname}', '${mobile_number}', '${full_address}',
                            '${landmark}', '${province}', '${province_id}', '${city}',
                            '${city_id}', '${postal_code}', '2022-01-22 00:00:00', '2022-01-22 00:00:00');`
        const [ add_address ] = await db.execute(ADD_ADDRESS);

        res.status(200).send(new utils.CreateRespond(
            200,
            "Add User Address Success",
            add_address
        ))
    } catch (error) {
        console.log(error);
    }
}

// INSERT INTO `db_warehouse`.`user_address` (
// 	`user_id`, `fullname`, `phone_number`, `full_address`, 
//     `landmark`, `province`, `province_id`, `city`, `city_id`, `
//     postal_code`) VALUES ('2', 'fsf', '423', 'fds', 'df', 'sdf', '2', 'Dfas', '23', '1212');
module.exports = {
    addAddress
}

