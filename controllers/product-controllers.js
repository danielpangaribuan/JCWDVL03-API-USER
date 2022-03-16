const utils = require('../utils');
const db = require('../database').promise();

const getProducts = async (req, res) => {
    try {
        const { product_name, category_id, warehouse_id } = req.query;
        const GET_PRODUCTS = `SELECT 
                                (@cnt := @cnt + 1) AS id, p.id AS product_id, p.product_name AS name, p.price AS price, pm.image, p.weight, i.quantity, w.id AS warehouse_id, w.warehouse_name, w.city_name, w.province_name
                            FROM
                                product p,
                                product_image AS pm,
                                inventory AS i,
                                warehouse AS w
                                CROSS JOIN (SELECT @cnt := 1) AS dummy
                            WHERE
                                p.id = pm.product_id
                                    AND pm.status = 1
                                    AND i.product_id = p.id
                                    AND p.product_name LIKE '%${ product_name ? product_name : '' }%'
                                    AND p.category_id = IFNULL(${ category_id ? category_id : null }, p.category_id)
                                    AND w.id = IFNULL(${ warehouse_id ? warehouse_id : null }, w.id)
                                    AND i.quantity > 0;`
        const [ get_product ] = await db.execute(GET_PRODUCTS);
        const data = get_product;

        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ))
    } catch (error) {
        console.log(error);
    }
}

const getCategory = async (req, res) => {
    try {
        const GET_CATEGORY = `SELECT * FROM db_warehouse.category;`
        const [ get_category ] = await db.execute(GET_CATEGORY);
        const data = get_category;

        res.status(200).send(new utils.CreateRespond(
            200,
            'Success',
            data
        ));
    } catch (error) {
        console.log(error)
    }
}

const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const GET_PRODUCT_DETAIL = `SELECT 
                                        p.id, p.product_name, p.weight, c.name AS category, p.price, p.description, q.quantity
                                    FROM
                                        product AS p,
                                        category AS c,
                                        (SELECT product_id, SUM(quantity) AS quantity FROM inventory GROUP BY product_id) AS q
                                    WHERE
                                        p.category_id = c.id
                                        AND q.product_id = p.id
                                        AND p.id = ${id};`;
        const GET_PRODUCT_IMAGE_DETAIL = `SELECT image, status FROM product_image WHERE product_id = ${id}`;

        const [ get_product_detail ] = await db.execute(GET_PRODUCT_DETAIL);
        const [ get_product_image ] = await db.execute(GET_PRODUCT_IMAGE_DETAIL);

        const data = { ...get_product_detail[0], image_group: get_product_image};

        res.status(200).send(new utils.CreateRespond(
            200,
            "Success",
            data
        ));
    } catch (error) {
        console.log(error);
    }
}

const getWarehouseLocation = async (req, res) => {
    try {
        const GET_WAREHOUSE_LOCATION = `SELECT * FROM warehouse;`;
        const [ get_warehouse_location ] = await db.execute(GET_WAREHOUSE_LOCATION);

        const data = get_warehouse_location;

        res.status(200).send(new utils.CreateRespond(
            200,
            "Success",
            data
        ));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getProducts,
    getCategory,
    getProductDetail,
    getWarehouseLocation
}
