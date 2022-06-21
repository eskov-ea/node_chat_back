import mngs from 'mongoose';
const {Schema, model} = mngs;


const DeviceTokenSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        token: { type: String, require: true },
        platform: { type: String, require: true },

    },
    {
        timestamps: true,
    }
);

const DeviceTokenModel = model("DeviceToken", DeviceTokenSchema);

export default DeviceTokenModel;
