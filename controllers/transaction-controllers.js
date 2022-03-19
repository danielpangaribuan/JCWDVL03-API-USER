const utils = require('../utils');
const db = require('../database').promise();
var _ = require('lodash');
var moment = require('moment');

let currDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

const addTransaction = async (req, res) => {
    const { total_price, delivery_fee, user_id, checkout_item, user_address_id, bank_id } = req.body;
    const product_quantity = _(checkout_item)
    .groupBy('product_id')
    .map((objs, key) => {
        return {
            'product_id': parseInt(key),
            'total_quantity': _.sumBy(objs, 'quantity')
        }
    }).value();
    try {
        const ADD_CART = `INSERT INTO cart (total_price, user_id) VALUES ('${total_price}', '${user_id}');`;
        const GET_ID_CART = `SELECT MAX(id) AS id FROM cart;`;
        const [ add_cart ] = await db.execute(ADD_CART)
        const [ cart_id ] = await db.execute(GET_ID_CART);

        await Promise.all(product_quantity.map( async (val, idx) => {
            const ADD_CART_DETAIL = `INSERT INTO cart_detail (cart_id, product_id, quantity) VALUES ('${cart_id[0].id}', '${val.product_id}', '${val.total_quantity}');`;
            const [ add_cart_detail ] = await db.execute(ADD_CART_DETAIL);
        }));

        const CHECK_TRANSACTION_DAY = `SELECT COUNT(*) AS cnt FROM transaction WHERE created_at = CURDATE();`
        const [ check_transaction_day ] = await db.execute(CHECK_TRANSACTION_DAY);

        const inv_date = moment().format("YYYYMMDD");
        const invoice = 'INV' + inv_date + check_transaction_day[0].cnt
        const ADD_TRANSACTION = `INSERT INTO transaction 
                                    (invoice_number, cart_id, user_address_id, delivery_fee,
                                    total_price, status_id, bank_id, created_at, updated_at)
                                VALUES ('${invoice}', '${cart_id[0].id}', '${user_address_id}', '${delivery_fee}', '${total_price}', 
                                        '1', '${bank_id}', '${currDateTime}', '${currDateTime}');`;
        const [ add_transaction ] = await db.execute(ADD_TRANSACTION);


        const ID_TRANSACTION = `SELECT MAX(id) AS id FROM transaction;`;
        const [ id_transaction ] = await db.execute(ID_TRANSACTION);

        await Promise.all(checkout_item.map( async (val, idx) => {
            const DELETE_QUANTITY_PRODUCT = `UPDATE inventory 
                                                SET 
                                                    quantity = quantity - ${val.quantity}
                                                WHERE
                                                    product_id = ${val.product_id} AND warehouse_id = ${val.warehouse_id};`;
            const [ delete_quantity_product ] = await db.execute(DELETE_QUANTITY_PRODUCT);

            const ADD_TRANSACTION_DETAIL = `INSERT INTO transaction_detail 
                                                (transaction_id,product_id,warehouse_id,quantity)
                                            VALUES 
                                                ('${id_transaction[0].id}', '${val.product_id}', '${val.warehouse_id}', '${val.quantity}');`;
            const [ add_transaction_detail ] = await db.execute(ADD_TRANSACTION_DETAIL);
        }));

        res.status(200).send(new utils.CreateRespond(
            200, 
            "Add Cart Success", 
            {add_cart, add_transaction}));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    addTransaction
}