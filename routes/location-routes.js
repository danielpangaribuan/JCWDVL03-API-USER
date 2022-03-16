const router = require('express').Router();
const axios = require('axios');
const db = require('../database').promise();
const utils = require('../utils');

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

router.get('/ongkos/:tujuan', async (req, res) => {
    const param = req.params;
    const arrWarehouse = [];
    const GET_WAREHOUSE_CITY = `SELECT id, city_id FROM warehouse;`;
    // const GET_PRODUCT_WAREHOUST = `SELECT 
    //                                     w.id, i.product_id AS product_id, i.quantity AS quantity
    //                                 FROM
    //                                     warehouse AS w,
    //                                     inventory AS i
    //                                 WHERE
    //                                     w.id = i.warehouse_id
    //                                     AND i.product_id IN(0, 1);`
    const [ get_warehouse_city ] = await db.execute(GET_WAREHOUSE_CITY);
    await Promise.all(get_warehouse_city.map(obj => 
        axios.post('/cost', {
            origin: obj.city_id,
            destination: param.tujuan,
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
            arrWarehouse.push({ warehouse_id: obj.id, cost: cost_reg });
        })
        .catch(err => res.send(err))
    ));
    arrWarehouse.sort(compare);
    res.status(200).send(new utils.CreateRespond(
        200,
        'Success',
        arrWarehouse
    ));
});
  
module.exports = router
  