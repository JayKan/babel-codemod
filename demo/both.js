// when we have both esModule and CommonJS fixed, treat it as an esModule file
function myFunction() { }
function otherFunction() { }

module.exports = myFunction;
module.exports.prop = 'some prop';
export { otherFunction };

