const utils = require("../utils");
const db = require("../database").promise();

const getProducts = async (req, res) => {
  try {
    const { product_name, category_id } = req.query;
    const GET_PRODUCTS = `SELECT 
                                p.id, p.product_name AS name, p.price AS price, pm.image
                            FROM
                                product p,
                                product_image AS pm
                            WHERE
                                p.id = pm.product_id
                                    AND pm.status = 1
                                    AND p.product_name LIKE '%${
                                      product_name ? product_name : ""
                                    }%'
                                    AND p.category_id = IFNULL(${
                                      category_id ? category_id : null
                                    }, p.category_id);`;
    const [get_product] = await db.execute(GET_PRODUCTS);
    const data = get_product;

    res.status(200).send(new utils.CreateRespond(200, "Success", data));
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getProducts,
};
