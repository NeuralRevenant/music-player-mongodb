const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    playList: [
        {
            audioId: {
                type: Schema.Types.ObjectId, ref: 'Product', required: true
            }
        }],
    resetToken: String,
    resetTokenExpiration: Date
});

userSchema.methods.addToPlaylist = function (product) {
    if (!product) {
        throw new Error("No such Music found!");
    }
    const x = this.playList.find(item => item.audioId.toString() === product._id.toString());
    if (x) {
        throw new Error("Already in your playlist! Can't add twice.");
    }
    const updatedList = [...this.playList];
    updatedList.push({ audioId: product._id });
    this.playList = updatedList;
    return this.save();
}

userSchema.methods.removeFromPlaylist = function (audioId) {
    const productInd = this.playList.findIndex(item => item.audioId.toString() === audioId);
    if (productInd === -1) {
        throw new Error("No such music in your playlist. Please check once again.");
    }
    const updatedList = [...this.playList];
    updatedList.splice(productInd, 1);
    this.playList = updatedList;
    return this.save();
}

userSchema.methods.clearPlaylist = function (arr) {
    let arrInd = 0;
    const updatedList = [];
    for (let item of this.playList) {
        if (arrInd < arr.length && item._id.toString() === arr[arrInd]._id.toString()) {
            arrInd++;
            continue;
        }
        updatedList.push(item);
    }
    this.playList = updatedList;
    return this.save();
}

module.exports = mongoose.model('User', userSchema); //collection_name='users'

