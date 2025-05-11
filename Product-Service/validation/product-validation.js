const joi = require('joi');
const ProductValidationSchema =  (data)=>{
    const schema = joi.object({
        name:joi.string().required(),
        description:joi.string().required(),
        cost:joi.number().required(),
        category:joi.string().valid('electronics','clothes','books','furniture').required()
    })
    return schema.validate(data);
}
module.exports = {ProductValidationSchema};