const utils = require('../utils');
const db = require('../database').promise();

const getPagination = (page, size) => {
    const limit = size ? +size : 2;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset }
}

const getProducts = async (req, res) => {
    try {
        const { product_name, category_id, sort, page, size } = req.query;
        const { limit, offset } = getPagination(page, size);

        const GET_PRODUCTS = `SELECT 
                                p.id, 
                                p.product_name AS product_name, 
                                p.price AS price, 
                                pm.image, 
                                p.weight, 
                                SUM(i.quantity) AS quantity
                            FROM
                                product p,
                                product_image AS pm,
                                inventory AS i
                            WHERE
                                p.id = pm.product_id
                                AND pm.status = 1
                                AND i.product_id = p.id
                                AND p.product_name LIKE '%${ product_name ? product_name : '' }%'
                                AND p.category_id = IFNULL(${ category_id ? category_id : null }, p.category_id)
                            GROUP BY p.id, pm.image
                            LIMIT ${limit} OFFSET ${offset};`

        const TOTAL_DATA = `SELECT 
                                p.id, 
                                p.product_name AS product_name, 
                                p.price AS price, 
                                pm.image, 
                                p.weight, 
                                SUM(i.quantity) AS quantity
                            FROM
                                product p,
                                product_image AS pm,
                                inventory AS i
                            WHERE
                                p.id = pm.product_id
                                AND pm.status = 1
                                AND i.product_id = p.id
                                AND p.product_name LIKE '%${ product_name ? product_name : '' }%'
                                AND p.category_id = IFNULL(${ category_id ? category_id : null }, p.category_id)
                            GROUP BY p.id, pm.image`;
        
        const [ get_product ] = await db.execute(GET_PRODUCTS);
        const [ total_data ] = await db.execute(TOTAL_DATA);
        const totalItems = total_data.length;
        // const data = get_product;
        const data = { 'rows': get_product, 'currentPage': parseInt(page), 'totalPage': Math.ceil(totalItems / limit), 'length' : totalItems,  };

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
