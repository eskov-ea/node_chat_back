import mngs from 'mongoose';
const {Schema, model} = mngs;

const MessageSchema = new Schema(
  {
    text: { type: String, require: Boolean },
    dialog: { type: Schema.Types.ObjectId, ref: "Dialog", require: true },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [{ type: Schema.Types.ObjectId, ref: "UploadFile" }],
    replyedText: { type: String, require: Boolean },
    replyedMessageId: { type: String, require: Boolean },
    replyedPartnerName: { type: String, require: Boolean },
  },
  {
    timestamps: true,
    usePushEach: true,
  }
);

const MessageModel = model("Message", MessageSchema);

export default MessageModel;
