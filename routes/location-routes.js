const router = require('express').Router();
const axios = require('axios');
const e = require('express');
const db = require('../database').promise();
const utils = require('../utils');
var _ = require('lodash');

axios.defaults.baseURL = 'https://api.rajaongkir.com/starter'
axios.defaults.headers.common['key'] = '9d16b2640fc22d1e7162061ed1067d8d'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

router.get('/provinsi', (req, res) => {
    axios.get('/province')
        .then(response => res.json(response.data))
        .catch(err => res.send(err))
})

// Router GET city by province_id
router.get('/kota/:provId', (req, res) => {
    const id = req.params.provId
    axios.get(`/city?province=${id}`)
        .then(response => res.json(response.data))
        .catch(err => res.send(err))
})

function compare (a, b) {
    if (a.cost < b.cost) {
        return -1;
    }
    if (a.cost > b.cost) {
        return 1;
    }
    return 0;
}
router.get('/ongkos/:destination', async (req, res) => {
    const param = req.params;
    const product_id = JSON.parse(req.query.product_id);
    const quantity_p = JSON.parse(req.query.quantity_p);

    const arrWarehouse = [];
    const GET_WAREHOUSE_CITY = `SELECT id, city_id FROM warehouse;`;
    
    const [ get_warehouse_city ] = await db.execute(GET_WAREHOUSE_CITY);
    await Promise.all(get_warehouse_city.map(obj => 
        axios.post('/cost', {
            origin: obj.city_id,
            destination: param.destination,
            weight: 1,
            courier: 'jne'
        })
        .then( async (response) => {
            let cost_reg = 0;
            await Promise.all(response.data.rajaongkir.results[0].costs.map(obj => {
                if (obj.service == "REG") {
                    cost_reg += obj.cost[0].value;
                }
            }))
            arrWarehouse.push({ warehouse_id: obj.id, cost: cost_reg, city_id: obj.city_id });
        })
        .catch(err => res.send(err))
    ));
    arrWarehouse.sort(compare);


    let checkout_item = [];
    await Promise.all(product_id.map( async (val, idx) => {
        let quantity_req = quantity_p[idx];

        await Promise.all(arrWarehouse.map( async (el) => {
            const GET_PRODUCT_WAREHOUSE = `SELECT 
                                                i.product_id AS product_id, i.quantity AS quantity, p.weight AS weight
                                            FROM
                                                warehouse AS w,
                                                inventory AS i,
                                                product AS p
                                            WHERE
                                                w.id = i.warehouse_id
                                                    AND i.product_id = p.id
                                                    AND i.product_id = ${val}
                                                    AND w.id = ${el.warehouse_id};`;
            
            const [ get_product_warehouse ] = await db.execute(GET_PRODUCT_WAREHOUSE);
            let quantity_input = 0;
            if (get_product_warehouse[0].quantity > quantity_req) {
                quantity_input = quantity_req;
                quantity_req = 0;
            } else {
                quantity_input = get_product_warehouse[0].quantity;
                quantity_req -= get_product_warehouse[0].quantity;
            }
            if (!quantity_input) return

            checkout_item.push({ warehouse_id: el.warehouse_id, product_id: val, quantity: quantity_input, weight: quantity_input * get_product_warehouse[0].weight, city_id: el.city_id });
        }));
    }));
    const group_by_warehouse = await _(checkout_item)
    .groupBy('city_id')
    .map((objs, key) => {
        return {
            'city_id': key,
            'total_weight': _.sumBy(objs, 'weight')
        }
    })
    .value();
    let total_cost = [];
    await Promise.all(group_by_warehouse.map(obj =>
        axios.post('/cost', {
            origin: obj.city_id,
            destination: param.destination,
            weight: obj.total_weight,
            courier: 'jne'
        })
        .then( async (response) => {
            let cost = 0;
            await Promise.all(response.data.rajaongkir.results[0].costs.map( async obj => {
                if (obj.service == "REG") {
                    cost += obj.cost[0].value;
                }
            }));
            total_cost += cost;
        })
        .catch(err => res.send(err))
    ))
    const data = { checkout_item, total_cost: parseFloat(total_cost) }
    res.status(200).send(new utils.CreateRespond(
        200,
        'Success',
        data
        // arrWarehouse
    ));
    

});
  
module.exports = router
  