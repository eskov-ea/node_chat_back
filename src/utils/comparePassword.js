import bcrypt from 'bcrypt';

export default (myPlaintextPassword, hash) => {return  bcrypt.compareSync(myPlaintextPassword, hash); }

//export default (password, hash) = bcrypt.compare(password, hash, function(err, result) {
//    return result;
//});
